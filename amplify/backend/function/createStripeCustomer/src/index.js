/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STRIPE_SECRET_KEY
	API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
Amplify Params - DO NOT EDIT */

const Stripe = require('stripe');
const https = require('https');
const AWS = require('aws-sdk');
const urlParse = require('url').URL;

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const { profileId, email, name } = event.arguments;
        
        if (!profileId || !email || !name) {
            throw new Error("Missing required parameters: profileId, email, and name");
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error("Stripe secret key not configured");
        }

        const stripe = new Stripe(stripeSecretKey);

        const customer = await stripe.customers.create({
            email: email,
            name: name,
            metadata: {
                profileId: profileId
            }
        });

        const graphqlEndpoint = process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT;
        const updateMutation = `
            mutation UpdateProfile($input: UpdateProfileInput!) {
                updateProfile(input: $input) {
                    id
                    stripeCustomerId
                }
            }
        `;

        const variables = {
            input: {
                id: profileId,
                stripeCustomerId: customer.id
            }
        };

        await graphqlRequest(graphqlEndpoint, updateMutation, variables);

        return {
            customerId: customer.id,
            success: true,
            message: `Successfully created Stripe customer for ${name}`
        };

    } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return {
            customerId: '',
            success: false,
            message: `Failed to create customer: ${error.message}`
        };
    }
};

async function graphqlRequest(endpoint, query, variables) {
    const uri = new urlParse(endpoint);
    const httpRequest = new AWS.HttpRequest(endpoint, process.env.REGION);
    
    httpRequest.headers.host = uri.host;
    httpRequest.headers['Content-Type'] = 'application/json';
    httpRequest.method = 'POST';
    httpRequest.body = JSON.stringify({ query, variables });

    const signer = new AWS.Signers.V4(httpRequest, 'appsync', true);
    signer.addAuthorization(AWS.config.credentials, new Date());

    return new Promise((resolve, reject) => {
        const request = https.request({ ...httpRequest, host: uri.host }, (result) => {
            let data = '';
            result.on('data', (chunk) => { data += chunk; });
            result.on('end', () => {
                const response = JSON.parse(data);
                if (response.errors) {
                    reject(new Error(JSON.stringify(response.errors)));
                } else {
                    resolve(response.data);
                }
            });
        });
        request.on('error', reject);
        request.write(httpRequest.body);
        request.end();
    });
}
