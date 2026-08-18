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
}
