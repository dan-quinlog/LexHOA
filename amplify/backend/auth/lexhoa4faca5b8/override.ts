import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
  if (amplifyProjectInfo.envName !== 'dev') {
    return;
  }

  const redirectUrls = [
    'http://localhost:3000/',
    'https://dev.lexingtoncommons-weco.com/',
  ];

  resources.userPoolClient.addPropertyOverride('CallbackURLs', redirectUrls);
  resources.userPoolClient.addPropertyOverride('LogoutURLs', redirectUrls);
  resources.userPoolClientWeb.addPropertyOverride('CallbackURLs', redirectUrls);
  resources.userPoolClientWeb.addPropertyOverride('LogoutURLs', redirectUrls);
}
