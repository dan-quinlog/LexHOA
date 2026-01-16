/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STRIPE_SECRET_KEY
	STRIPE_WEBHOOK_SECRET
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
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (!stripeSecretKey || !webhookSecret) {
            throw new Error("Stripe keys not configured");
        }

        const stripe = new Stripe(stripeSecretKey);
        
        const sig = event.headers['Stripe-Signature'] || event.headers['stripe-signature'];
        const body = event.body;

        let stripeEvent;
        try {
            stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Webhook signature verification failed' })
            };
        }

        console.log('Webhook event type:', stripeEvent.type);

        switch (stripeEvent.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(stripeEvent.data.object);
                break;
            case 'payment_intent.processing':
                await handlePaymentProcessing(stripeEvent.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(stripeEvent.data.object);
                break;
            case 'payment_intent.canceled':
                await handlePaymentCanceled(stripeEvent.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Error handling webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function getPaymentMethod(metadata) {
    const methodType = metadata.paymentMethodType;
    if (methodType === 'us_bank_account') {
        return 'STRIPE_ACH';
    }
    return 'STRIPE_CARD';
}

async function handlePaymentSuccess(paymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const profileId = metadata.profileId;
    const duesAmount = parseFloat(metadata.duesAmount);
    const processingFee = parseFloat(metadata.processingFee);
    const description = metadata.description;
    const paymentMethod = getPaymentMethod(metadata);

    const createPaymentMutation = `
        mutation CreatePayment($input: CreatePaymentInput!) {
            createPayment(input: $input) {
                id
                amount
                status
            }
        }
    `;

    const paymentInput = {
        ownerPaymentsId: profileId,
        paymentMethod: paymentMethod,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        amount: duesAmount,
        processingFee: processingFee,
        totalAmount: duesAmount + processingFee,
        status: 'SUCCEEDED',
        description: description || 'HOA Dues Payment',
        checkDate: null,
        checkNumber: null,
        checkAmount: null,
        invoiceNumber: paymentIntent.id,
        invoiceAmount: duesAmount
    };

    await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        createPaymentMutation,
        { input: paymentInput }
    );

    const getProfileQuery = `
        query GetProfile($id: ID!) {
            getProfile(id: $id) {
                id
                balance
            }
        }
    `;

    const profileResult = await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        getProfileQuery,
        { id: profileId }
    );

    const currentBalance = profileResult.getProfile.balance || 0;
    const newBalance = currentBalance - duesAmount;

    const updateProfileMutation = `
        mutation UpdateProfile($input: UpdateProfileInput!) {
            updateProfile(input: $input) {
                id
                balance
            }
        }
    `;

    await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        updateProfileMutation,
        { input: { id: profileId, balance: newBalance } }
    );

    console.log(`Payment recorded and balance updated for profile ${profileId}`);
}

async function handlePaymentProcessing(paymentIntent) {
    console.log('Payment processing (ACH):', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const profileId = metadata.profileId;
    const duesAmount = parseFloat(metadata.duesAmount);
    const processingFee = parseFloat(metadata.processingFee);
    const paymentMethod = getPaymentMethod(metadata);

    const createPaymentMutation = `
        mutation CreatePayment($input: CreatePaymentInput!) {
            createPayment(input: $input) {
                id
                status
            }
        }
    `;

    const paymentInput = {
        ownerPaymentsId: profileId,
        paymentMethod: paymentMethod,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        amount: duesAmount,
        processingFee: processingFee,
        totalAmount: duesAmount + processingFee,
        status: 'PROCESSING',
        description: metadata.description || 'HOA Dues Payment (ACH)',
        invoiceNumber: paymentIntent.id,
        invoiceAmount: duesAmount
    };

    await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        createPaymentMutation,
        { input: paymentInput }
    );

    console.log(`ACH payment processing recorded for profile ${profileId}`);
}

async function handlePaymentFailure(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const profileId = metadata.profileId;
    const duesAmount = parseFloat(metadata.duesAmount);
    const processingFee = parseFloat(metadata.processingFee);
    const paymentMethod = getPaymentMethod(metadata);

    const createPaymentMutation = `
        mutation CreatePayment($input: CreatePaymentInput!) {
            createPayment(input: $input) {
                id
                status
            }
        }
    `;

    const paymentInput = {
        ownerPaymentsId: profileId,
        paymentMethod: paymentMethod,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        amount: duesAmount,
        processingFee: processingFee,
        totalAmount: duesAmount + processingFee,
        status: 'FAILED',
        description: metadata.description || 'HOA Dues Payment',
        invoiceNumber: paymentIntent.id,
        invoiceAmount: duesAmount
    };

    await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        createPaymentMutation,
        { input: paymentInput }
    );

    console.log(`Failed payment recorded for profile ${profileId}`);
}

async function handlePaymentCanceled(paymentIntent) {
    console.log('Payment canceled:', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const profileId = metadata.profileId;
    const duesAmount = parseFloat(metadata.duesAmount);
    const processingFee = parseFloat(metadata.processingFee);
    const paymentMethod = getPaymentMethod(metadata);

    const createPaymentMutation = `
        mutation CreatePayment($input: CreatePaymentInput!) {
            createPayment(input: $input) {
                id
                status
            }
        }
    `;

    const paymentInput = {
        ownerPaymentsId: profileId,
        paymentMethod: paymentMethod,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        amount: duesAmount,
        processingFee: processingFee,
        totalAmount: duesAmount + processingFee,
        status: 'CANCELED',
        description: metadata.description || 'HOA Dues Payment',
        invoiceNumber: paymentIntent.id,
        invoiceAmount: duesAmount
    };

    await graphqlRequest(
        process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
        createPaymentMutation,
        { input: paymentInput }
    );

    console.log(`Canceled payment recorded for profile ${profileId}`);
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
