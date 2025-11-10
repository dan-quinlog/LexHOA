/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STRIPE_SECRET_KEY
Amplify Params - DO NOT EDIT */

const Stripe = require('stripe');

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const { amount, profileId, description } = event.arguments;
        
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

        const stripeFeePercentage = 0.029;
        const stripeFeeFixed = 0.30;
        const processingFee = (amount * stripeFeePercentage) + stripeFeeFixed;
        const totalAmount = amount + processingFee;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                profileId: profileId,
                duesAmount: amount.toFixed(2),
                processingFee: processingFee.toFixed(2),
                description: description || 'HOA Dues Payment'
            },
            description: description || 'HOA Dues Payment'
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: parseFloat(amount.toFixed(2)),
            processingFee: parseFloat(processingFee.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2))
        };

    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
};
