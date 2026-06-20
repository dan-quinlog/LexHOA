/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTHNET_SIGNATURE_KEY
	API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
Amplify Params - DO NOT EDIT */

const crypto = require('crypto');
const https = require('https');
const AWS = require('aws-sdk');
const urlParse = require('url').URL;

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const signatureKey = process.env.AUTHNET_SIGNATURE_KEY;
        
        if (!signatureKey) {
            throw new Error("Authorize.Net signature key not configured");
        }

        // Verify webhook signature
        const webhookSignature = event.headers['X-ANET-Signature'] || event.headers['x-anet-signature'];
        const body = event.body;

        if (webhookSignature) {
            const hash = crypto.createHmac('sha512', signatureKey)
                .update(body)
                .digest('hex')
                .toUpperCase();
            
            const receivedHash = webhookSignature.replace('sha512=', '').toUpperCase();
            
            if (hash !== receivedHash) {
                console.error('Webhook signature verification failed');
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Webhook signature verification failed' })
                };
            }
        }

        const webhookEvent = JSON.parse(body);
        console.log('Webhook event type:', webhookEvent.eventType);

        switch (webhookEvent.eventType) {
            case 'net.authorize.payment.authcapture.created':
                await handlePaymentCreated(webhookEvent.payload);
                break;
            case 'net.authorize.payment.refund.created':
                await handleRefund(webhookEvent.payload);
                break;
            case 'net.authorize.payment.void.created':
                await handleVoid(webhookEvent.payload);
                break;
            default:
                console.log(`Unhandled event type: ${webhookEvent.eventType}`);
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

async function handlePaymentCreated(payload) {
    console.log('Payment created:', payload.id);
    // Payment records are created synchronously when the transaction is processed,
    // so this webhook primarily serves as a backup confirmation.
    // No action needed unless we want to reconcile.
}

async function handleRefund(payload) {
    console.log('Refund created:', payload.id);
    
    const transactionId = payload.id;
    
    // Update the payment status to REFUNDED
    const updatePaymentMutation = `
        mutation UpdatePayment($input: UpdatePaymentInput!) {
            updatePayment(input: $input) {
                id
                status
            }
        }
    `;

    // Find payment by transaction ID and update status
    const findPaymentQuery = `
        query PaymentsByAuthNetTransaction($authNetTransactionId: String!) {
            paymentsByAuthNetTransaction(authNetTransactionId: $authNetTransactionId) {
                items {
                    id
                    amount
                    ownerPaymentsId
                }
            }
        }
    `;

    try {
        const paymentResult = await graphqlRequest(
            process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
            findPaymentQuery,
            { authNetTransactionId: transactionId }
        );

        const payment = paymentResult?.paymentsByAuthNetTransaction?.items?.[0];
        if (payment) {
            await graphqlRequest(
                process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
                updatePaymentMutation,
                { input: { id: payment.id, status: 'REFUNDED' } }
            );

            // Restore the balance
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
                { id: payment.ownerPaymentsId }
            );

            const currentBalance = profileResult.getProfile.balance || 0;
            const newBalance = currentBalance + payment.amount;

            await graphqlRequest(
                process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
                `mutation UpdateProfile($input: UpdateProfileInput!) {
                    updateProfile(input: $input) { id balance }
                }`,
                { input: { id: payment.ownerPaymentsId, balance: newBalance } }
            );
        }
    } catch (err) {
        console.error('Error processing refund webhook:', err);
    }
}

async function handleVoid(payload) {
    console.log('Void created:', payload.id);
    // Similar to refund handling
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
