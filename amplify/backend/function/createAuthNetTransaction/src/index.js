/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTHNET_API_LOGIN_ID
	AUTHNET_TRANSACTION_KEY
	AUTHNET_ENVIRONMENT
Amplify Params - DO NOT EDIT */

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;
const AWS = require('aws-sdk');
const https = require('https');
const urlParse = require('url').URL;

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const { amount, profileId, description, email, paymentMethodType, opaqueDataDescriptor, opaqueDataValue } = event.arguments;
        
        if (!amount || !profileId) {
            throw new Error("Missing required parameters: amount and profileId");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        if (!opaqueDataDescriptor || !opaqueDataValue) {
            throw new Error("Missing payment token data");
        }

        const apiLoginId = process.env.AUTHNET_API_LOGIN_ID;
        const transactionKey = process.env.AUTHNET_TRANSACTION_KEY;
        if (!apiLoginId || !transactionKey) {
            throw new Error("Authorize.Net credentials not configured");
        }

        // Calculate fees based on payment method type
        let processingFee;
        if (paymentMethodType === 'bank_account') {
            processingFee = Math.min(amount * 0.008, 5.00);
        } else {
            processingFee = (amount * 0.029) + 0.30;
        }
        
        const totalAmount = Math.round((amount + processingFee) * 100) / 100;
        processingFee = Math.round(processingFee * 100) / 100;

        // Set up merchant authentication
        const merchantAuth = new ApiContracts.MerchantAuthenticationType();
        merchantAuth.setName(apiLoginId);
        merchantAuth.setTransactionKey(transactionKey);

        // Set up payment with opaque data from Accept.js
        const opaqueData = new ApiContracts.OpaqueDataType();
        opaqueData.setDataDescriptor(opaqueDataDescriptor);
        opaqueData.setDataValue(opaqueDataValue);

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setOpaqueData(opaqueData);

        // Set up order
        const orderDetails = new ApiContracts.OrderType();
        orderDetails.setInvoiceNumber('INV-' + Date.now().toString(36).toUpperCase());
        orderDetails.setDescription(description || 'HOA Dues Payment');

        // Set up customer
        const customer = new ApiContracts.CustomerDataType();
        customer.setEmail(email || '');

        // Set up user fields to store metadata
        const userField1 = new ApiContracts.UserField();
        userField1.setName('profileId');
        userField1.setValue(profileId);

        const userField2 = new ApiContracts.UserField();
        userField2.setName('duesAmount');
        userField2.setValue(amount.toFixed(2));

        const userField3 = new ApiContracts.UserField();
        userField3.setName('processingFee');
        userField3.setValue(processingFee.toFixed(2));

        const userField4 = new ApiContracts.UserField();
        userField4.setName('paymentMethodType');
        userField4.setValue(paymentMethodType || 'card');

        const userFields = new ApiContracts.TransactionRequestType.UserFields();
        userFields.setUserField([userField1, userField2, userField3, userField4]);

        // Create transaction request
        const transactionRequest = new ApiContracts.TransactionRequestType();
        transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequest.setPayment(paymentType);
        transactionRequest.setAmount(totalAmount);
        transactionRequest.setOrder(orderDetails);
        transactionRequest.setCustomer(customer);
        transactionRequest.setUserFields(userFields);

        const createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuth);
        createRequest.setTransactionRequest(transactionRequest);

        // Execute the transaction
        const result = await executeTransaction(createRequest);

        // Card payments capture and settle immediately, so reduce the balance now.
        // eCheck (bank_account) payments only "approve" at submission and take
        // 1-5 business days to actually settle, and can still be returned (NSF,
        // closed account, etc.). We therefore hold the balance and leave the
        // payment PENDING; the balance is reduced later during reconciliation
        // once the transaction settles successfully.
        const settlementPending = paymentMethodType === 'bank_account';
        if (!settlementPending) {
            // Failure here must not fail the payment (funds were already captured).
            try {
                await reduceProfileBalance(profileId, amount);
            } catch (balanceError) {
                console.error('Failed to update profile balance after payment:', balanceError);
            }
        }

        return {
            transactionId: result.transactionId,
            authCode: result.authCode,
            amount: parseFloat(amount.toFixed(2)),
            processingFee: processingFee,
            totalAmount: totalAmount,
            paymentMethodType: paymentMethodType || 'card',
            settlementPending: settlementPending,
            responseCode: result.responseCode,
            messageCode: result.messageCode,
            messageText: result.messageText
        };

    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
    }
};

function executeTransaction(createRequest) {
    return new Promise((resolve, reject) => {
        const environment = process.env.AUTHNET_ENVIRONMENT === 'production' 
            ? SDKConstants.endpoint.production 
            : SDKConstants.endpoint.sandbox;

        const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
        ctrl.setEnvironment(environment);

        ctrl.execute(function() {
            const apiResponse = ctrl.getResponse();
            const response = new ApiContracts.CreateTransactionResponse(apiResponse);

            if (response === null) {
                reject(new Error('No response from Authorize.Net'));
                return;
            }

            if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                const transactionResponse = response.getTransactionResponse();
                if (transactionResponse.getMessages()) {
                    resolve({
                        transactionId: transactionResponse.getTransId(),
                        authCode: transactionResponse.getAuthCode(),
                        responseCode: transactionResponse.getResponseCode(),
                        messageCode: transactionResponse.getMessages().getMessage()[0].getCode(),
                        messageText: transactionResponse.getMessages().getMessage()[0].getDescription()
                    });
                } else {
                    const errorText = transactionResponse.getErrors() 
                        ? transactionResponse.getErrors().getError()[0].getErrorText()
                        : 'Transaction failed';
                    reject(new Error(errorText));
                }
            } else {
                const transactionResponse = response.getTransactionResponse();
                if (transactionResponse && transactionResponse.getErrors()) {
                    reject(new Error(transactionResponse.getErrors().getError()[0].getErrorText()));
                } else {
                    reject(new Error(response.getMessages().getMessage()[0].getText()));
                }
            }
        });
    });
}

async function reduceProfileBalance(profileId, duesAmount) {
    const endpoint = process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT;

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
    const newBalance = Math.max(0, Math.round((currentBalance - duesAmount) * 100) / 100);

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
