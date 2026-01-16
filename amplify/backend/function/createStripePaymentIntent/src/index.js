/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STRIPE_SECRET_KEY
Amplify Params - DO NOT EDIT */

const Stripe = require('stripe');

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const { amount, profileId, description, email, paymentMethodType } = event.arguments;
        
        if (!amount || !profileId) {
            throw new Error("Missing required parameters: amount and profileId");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error("Stripe secret key not configured");
        }

        const stripe = new Stripe(stripeSecretKey);

        // Calculate fees based on payment method type
        // Card: 2.9% + $0.30
        // ACH: 0.8% capped at $5.00
        let processingFee;
        let stripePaymentMethodTypes;
        
        if (paymentMethodType === 'us_bank_account') {
            // ACH fee: 0.8% capped at $5.00
            processingFee = Math.min(amount * 0.008, 5.00);
            stripePaymentMethodTypes = ['us_bank_account'];
        } else {
            // Card fee: 2.9% + $0.30
            processingFee = (amount * 0.029) + 0.30;
            stripePaymentMethodTypes = ['card'];
        }
        
        const totalAmount = amount + processingFee;

        const paymentIntentConfig = {
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            payment_method_types: stripePaymentMethodTypes,
            receipt_email: email || null,
            metadata: {
                profileId: profileId,
                duesAmount: amount.toFixed(2),
                processingFee: processingFee.toFixed(2),
                paymentMethodType: paymentMethodType || 'card',
                description: description || 'HOA Dues Payment'
            },
            description: description || 'HOA Dues Payment'
        };

        // ACH requires additional setup for verification
        if (paymentMethodType === 'us_bank_account') {
            paymentIntentConfig.payment_method_options = {
                us_bank_account: {
                    financial_connections: {
                        permissions: ['payment_method']
                    }
                }
            };
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: parseFloat(amount.toFixed(2)),
            processingFee: parseFloat(processingFee.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            paymentMethodType: paymentMethodType || 'card'
        };

    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
};
