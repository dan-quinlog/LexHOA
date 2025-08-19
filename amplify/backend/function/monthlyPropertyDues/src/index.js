/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
	API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT
	API_LEXHOA_GRAPHQLAPIKEYOUTPUT
	DUES_AMOUNT
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

/**
 * GraphQL resolver and scheduled function for processing monthly property dues
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log('Starting monthly property dues processing...');
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const propertyDues = parseFloat(process.env.DUES_AMOUNT || '50');
        const tableName = `Profile-${process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`;
        
        console.log(`Processing dues of $${propertyDues} for table: ${tableName}`);
        
        let processedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Scan for all profiles with at least 1 property
        const scanParams = {
            TableName: tableName,
            FilterExpression: 'attribute_exists(ownedProperties) AND size(ownedProperties) > :zero',
            ExpressionAttributeValues: {
                ':zero': 0
            }
        };
        
        let lastEvaluatedKey = null;
        do {
            if (lastEvaluatedKey) {
                scanParams.ExclusiveStartKey = lastEvaluatedKey;
            }
            
            const scanResult = await dynamodb.scan(scanParams).promise();
            
            for (const profile of scanResult.Items) {
                try {
                    const currentBalance = parseFloat(profile.balance || 0);
                    const newBalance = currentBalance + propertyDues;
                    
                    const updateParams = {
                        TableName: tableName,
                        Key: { id: profile.id },
                        UpdateExpression: 'SET balance = :newBalance, updatedAt = :timestamp',
                        ExpressionAttributeValues: {
                            ':newBalance': newBalance,
                            ':timestamp': new Date().toISOString()
                        }
                    };
                    
                    await dynamodb.update(updateParams).promise();
                    processedCount++;
                    
                    console.log(`Updated profile ${profile.id}: $${currentBalance} -> $${newBalance}`);
                    
                } catch (updateError) {
                    console.error(`Error updating profile ${profile.id}:`, updateError);
                    errors.push({
                        profileId: profile.id,
                        error: updateError.message
                    });
                    errorCount++;
                }
            }
            
            lastEvaluatedKey = scanResult.LastEvaluatedKey;
            
        } while (lastEvaluatedKey);
        
        const result = {
            success: true,
            message: `Monthly property dues processed successfully. Updated ${processedCount} profiles with $${propertyDues} dues each.${errorCount > 0 ? ` ${errorCount} errors occurred.` : ''}`
        };
        
        console.log('Monthly property dues processing completed:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error processing monthly property dues:', error);
        
        return {
            success: false,
            message: `Failed to process monthly property dues: ${error.message}`
        };
    }
};
