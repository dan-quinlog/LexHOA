/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTHNET_API_LOGIN_ID
	AUTHNET_TRANSACTION_KEY
	AUTHNET_ENVIRONMENT
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
	API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT
	API_LEXHOA_GRAPHQLAPIKEYOUTPUT
Amplify Params - DO NOT EDIT */

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;
const AWS = require('aws-sdk');
const https = require('https');
const urlParse = require('url').URL;

// Authorize.Net transaction statuses (from getTransactionDetailsRequest) mapped
// to what they mean for our payment records. eCheck (ACH) transactions move
// through these states over 1-5 business days.
//
// Anything not listed here is treated as "still pending" and left unchanged so
// the next scheduled run can re-check it.
const SETTLED_STATUSES = new Set([
    'settledSuccessfully'
]);

const FAILED_STATUSES = new Set([
    'declined',
    'expired',
    'generalError',
    'failedReview',
    'settlementError',
    'voided',
    'returnedItem',
    'chargeback',
    'chargebackReversal'
]);

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const apiLoginId = process.env.AUTHNET_API_LOGIN_ID;
    const transactionKey = process.env.AUTHNET_TRANSACTION_KEY;
    const endpoint = process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT;

    if (!apiLoginId || !transactionKey) {
        throw new Error('Authorize.Net credentials not configured');
    }

    const summary = { checked: 0, settled: 0, failed: 0, stillPending: 0, errors: 0 };

    try {
        const pendingPayments = await getPendingEcheckPayments(endpoint);
        console.log(`Found ${pendingPayments.length} pending eCheck payment(s) to reconcile.`);

        for (const payment of pendingPayments) {
            summary.checked++;

            if (!payment.authNetTransactionId) {
                console.warn(`Payment ${payment.id} has no Authorize.Net transaction ID; skipping.`);
                continue;
            }

            try {
                const { transactionStatus } = await getTransactionDetails(payment.authNetTransactionId);
                console.log(`Payment ${payment.id} (txn ${payment.authNetTransactionId}) status: ${transactionStatus}`);

                if (SETTLED_STATUSES.has(transactionStatus)) {
                    await updatePaymentStatus(endpoint, payment.id, 'SUCCEEDED');
                    // The balance was held (not reduced) at submission time, so
                    // apply the reduction now that the funds have settled.
                    await reduceProfileBalance(endpoint, payment.ownerPaymentsId, payment.amount);
                    summary.settled++;
                    console.log(`Payment ${payment.id} settled: marked SUCCEEDED and reduced balance by ${payment.amount}.`);
                } else if (FAILED_STATUSES.has(transactionStatus)) {
                    await updatePaymentStatus(endpoint, payment.id, 'FAILED');
                    // Balance was never reduced for a pending eCheck, so nothing
                    // to restore here.
                    summary.failed++;
                    console.log(`Payment ${payment.id} did not clear (${transactionStatus}): marked FAILED.`);
                } else {
                    summary.stillPending++;
                    console.log(`Payment ${payment.id} still pending (${transactionStatus}); leaving unchanged.`);
                }
            } catch (paymentError) {
                summary.errors++;
                console.error(`Error reconciling payment ${payment.id}:`, paymentError);
            }
        }

        console.log('Reconciliation complete:', JSON.stringify(summary));
        return { success: true, ...summary };

    } catch (error) {
        console.error('Error running eCheck reconciliation:', error);
        return { success: false, message: error.message, ...summary };
    }
};

// Fetch all payments that are still pending settlement and were paid by eCheck.
async function getPendingEcheckPayments(endpoint) {
    const query = `
        query PendingPayments($filter: ModelPaymentFilterInput, $nextToken: String) {
            paymentsByTypeCreatedAt(
                byTypeCreatedAt: "PAYMENT"
                filter: $filter
                limit: 100
                nextToken: $nextToken
            ) {
                items {
                    id
                    amount
                    status
                    paymentMethod
                    authNetTransactionId
                    ownerPaymentsId
                }
                nextToken
            }
        }
    `;

    const filter = {
        status: { in: ['PENDING', 'PROCESSING'] },
        paymentMethod: { eq: 'BANK_ACCOUNT' }
    };

    const payments = [];
    let nextToken = null;

    do {
        const data = await graphqlRequest(endpoint, query, { filter, nextToken });
        const page = data?.paymentsByTypeCreatedAt;
        if (page?.items) {
            payments.push(...page.items);
        }
        nextToken = page?.nextToken || null;
    } while (nextToken);

    return payments;
}

// Query Authorize.Net for the current status of a transaction.
function getTransactionDetails(transId) {
    return new Promise((resolve, reject) => {
        const merchantAuth = new ApiContracts.MerchantAuthenticationType();
        merchantAuth.setName(process.env.AUTHNET_API_LOGIN_ID);
        merchantAuth.setTransactionKey(process.env.AUTHNET_TRANSACTION_KEY);

        const request = new ApiContracts.GetTransactionDetailsRequest();
        request.setMerchantAuthentication(merchantAuth);
        request.setTransId(transId);

        const ctrl = new ApiControllers.GetTransactionDetailsController(request.getJSON());
        ctrl.setEnvironment(
            process.env.AUTHNET_ENVIRONMENT === 'production'
                ? SDKConstants.endpoint.production
                : SDKConstants.endpoint.sandbox
        );

        ctrl.execute(function () {
            const apiResponse = ctrl.getResponse();
            const response = new ApiContracts.GetTransactionDetailsResponse(apiResponse);

            if (response === null) {
                reject(new Error('No response from Authorize.Net'));
                return;
            }

            if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                const transaction = response.getTransaction();
                resolve({
                    transactionStatus: transaction.getTransactionStatus(),
                    settleAmount: transaction.getSettleAmount()
                });
            } else {
                const message = response.getMessages().getMessage()[0];
                reject(new Error(`${message.getCode()}: ${message.getText()}`));
            }
        });
    });
}

async function updatePaymentStatus(endpoint, paymentId, status) {
    const mutation = `
        mutation UpdatePayment($input: UpdatePaymentInput!) {
            updatePayment(input: $input) {
                id
                status
            }
        }
    `;
    await graphqlRequest(endpoint, mutation, { input: { id: paymentId, status } });
}

async function reduceProfileBalance(endpoint, profileId, amount) {
    if (!profileId || !amount) {
        return;
    }

    const getProfileQuery = `
        query GetProfile($id: ID!) {
            getProfile(id: $id) {
                id
                balance
            }
        }
    `;

    const profileResult = await graphqlRequest(endpoint, getProfileQuery, { id: profileId });
    const profile = profileResult?.getProfile;
    if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
    }

    const currentBalance = profile.balance || 0;
    const newBalance = Math.max(0, Math.round((currentBalance - amount) * 100) / 100);

    const updateProfileMutation = `
        mutation UpdateProfile($input: UpdateProfileInput!) {
            updateProfile(input: $input) {
                id
                balance
            }
        }
    `;

    await graphqlRequest(endpoint, updateProfileMutation, {
        input: { id: profileId, balance: newBalance }
    });

    console.log(`Profile ${profileId} balance updated: ${currentBalance} -> ${newBalance}`);
}

function graphqlRequest(endpoint, query, variables) {
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
