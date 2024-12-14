const amplifyConfig = {
  aws_project_region: process.env.REACT_APP_AWS_REGION,
  aws_appsync_graphqlEndpoint: process.env.REACT_APP_APPSYNC_ENDPOINT,
  aws_appsync_region: process.env.REACT_APP_AWS_REGION,
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  aws_appsync_apiKey: process.env.REACT_APP_API_KEY,
  aws_cognito_region: process.env.REACT_APP_AWS_REGION,
  aws_user_pools_id: process.env.REACT_APP_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.REACT_APP_CLIENT_ID,
  oauth: {
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    scope: [
      'email',
      'openid',
      'profile',
      'aws.cognito.signin.user.admin'
    ],
    redirectSignIn: process.env.REACT_APP_REDIRECT_SIGN_IN,
    redirectSignOut: process.env.REACT_APP_REDIRECT_SIGN_OUT,
    responseType: 'code'
  }
};

export default amplifyConfig;
