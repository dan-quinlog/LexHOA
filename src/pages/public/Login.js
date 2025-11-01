  import React from 'react';
  import { signInWithRedirect } from '@aws-amplify/auth';
  import { Amplify } from 'aws-amplify';

  function Login() {
    const handleLogin = () => {
      const config = Amplify.getConfig();
      console.log('=== Amplify Full Config ===');
      console.log(config);
      console.log('=== Auth Config ===');
      console.log(config.Auth);
      console.log('=== Auth.Cognito ===');
      console.log(config.Auth?.Cognito);
      console.log('=== OAuth Config ===');
      console.log(config.Auth?.Cognito?.loginWith?.oauth);
      signInWithRedirect();
    };

    return (
      <button onClick={handleLogin}>Login</button>
    );
  }

  export default Login;
