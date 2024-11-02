
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';

const updatedAwsConfig = {
  ...awsmobile,
  oauth: {
    ...awsmobile.oauth,
    domain: 'lexhoa.auth.us-east-1.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'http://localhost:3000/',
    redirectSignOut: 'http://localhost:3000/',
    responseType: 'code'
  }
};

Amplify.configure(updatedAwsConfig);
Amplify.configure(awsmobile);