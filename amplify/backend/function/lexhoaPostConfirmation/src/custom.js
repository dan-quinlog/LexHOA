const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log('Create Person Trigger Event:', JSON.stringify(event));
    
    const personData = {
        id: event.request.userAttributes.sub,
        cognitoID: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
        name: event.request.userAttributes.name,
        type: 'Person',
        allowText: false,
        owner: event.request.userAttributes.sub,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const params = {
        TableName: process.env.API_LEXHOA_PERSONTABLE_NAME,
        Item: personData
    };
    
    try {
        await docClient.put(params).promise();
        return event;
    } catch (err) {
        console.error('Error creating person:', err);
        throw err;
    }
};