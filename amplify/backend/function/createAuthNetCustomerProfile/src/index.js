/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTHNET_API_LOGIN_ID
	AUTHNET_TRANSACTION_KEY
	AUTHNET_ENVIRONMENT
	API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
Amplify Params - DO NOT EDIT */

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;
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

        const apiLoginId = process.env.AUTHNET_API_LOGIN_ID;
        const transactionKey = process.env.AUTHNET_TRANSACTION_KEY;
        if (!apiLoginId || !transactionKey) {
            throw new Error("Authorize.Net credentials not configured");
        }

        // Set up merchant authentication
        const merchantAuth = new ApiContracts.MerchantAuthenticationType();
        merchantAuth.setName(apiLoginId);
        merchantAuth.setTransactionKey(transactionKey);

        // Create customer profile
        const customerProfile = new ApiContracts.CustomerProfileType();
        customerProfile.setMerchantCustomerId(profileId);
        customerProfile.setEmail(email);
        customerProfile.setDescription(name);

        const createRequest = new ApiContracts.CreateCustomerProfileRequest();
        createRequest.setMerchantAuthentication(merchantAuth);
        createRequest.setProfile(customerProfile);

        const customerId = await executeCreateCustomerProfile(createRequest);

        // Update profile in database with Authorize.Net customer profile ID
        const graphqlEndpoint = process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT;
        const updateMutation = `
            mutation UpdateProfile($input: UpdateProfileInput!) {
                updateProfile(input: $input) {
                    id
                    authNetCustomerProfileId
                }
            }
        `;

        const variables = {
            input: {
                id: profileId,
                authNetCustomerProfileId: customerId
            }
        };

        await graphqlRequest(graphqlEndpoint, updateMutation, variables);

        return {
            customerId: customerId,
            success: true,
            message: `Successfully created Authorize.Net customer profile for ${name}`
        };

    } catch (error) {
        console.error('Error creating Authorize.Net customer profile:', error);
        return {
            customerId: '',
            success: false,
            message: `Failed to create customer profile: ${error.message}`
        };
    }
};

function executeCreateCustomerProfile(createRequest) {
    return new Promise((resolve, reject) => {
        const environment = process.env.AUTHNET_ENVIRONMENT === 'production' 
            ? SDKConstants.endpoint.production 
            : SDKConstants.endpoint.sandbox;

        const ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
        ctrl.setEnvironment(environment);

        ctrl.execute(function() {
            const apiResponse = ctrl.getResponse();
            const response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

            if (response === null) {
                reject(new Error('No response from Authorize.Net'));
                return;
            }

            if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                resolve(response.getCustomerProfileId());
            } else {
                reject(new Error(response.getMessages().getMessage()[0].getText()));
            }
        });
    });
}

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
