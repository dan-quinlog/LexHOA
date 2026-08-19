import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
  const redirectUrls = amplifyProjectInfo.envName === 'dev'
    ? ['http://localhost:3000/', 'https://dev.lexingtoncommons-weco.com/']
    : amplifyProjectInfo.envName === 'staging'
      ? ['http://localhost:3000/', 'https://staging.lexingtoncommons-weco.com/']
      : null;

  if (!redirectUrls) return;

  resources.userPoolClient.addPropertyOverride('CallbackURLs', redirectUrls);
  resources.userPoolClient.addPropertyOverride('LogoutURLs', redirectUrls);
  resources.userPoolClientWeb.addPropertyOverride('CallbackURLs', redirectUrls);
  resources.userPoolClientWeb.addPropertyOverride('LogoutURLs', redirectUrls);

  if (amplifyProjectInfo.envName !== 'dev') return;

  const functionArn = {
    'Fn::Sub': `arn:aws:lambda:\${AWS::Region}:\${AWS::AccountId}:function:GenerateProfileOnSignUp-${amplifyProjectInfo.envName}`
  };
  resources.userPool.addPropertyOverride('LambdaConfig.PostConfirmation', functionArn);
  resources.addCfnResource({
    type: 'AWS::Lambda::Permission',
    properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: functionArn,
      Principal: 'cognito-idp.amazonaws.com',
      SourceArn: { 'Fn::GetAtt': ['UserPool', 'Arn'] }
    }
  }, 'GenerateProfileOnSignUpPostConfirmationPermission');
}
