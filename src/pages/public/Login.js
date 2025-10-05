  import React from 'react';
  import { signInWithRedirect } from '@aws-amplify/auth';

  function Login() {
    const handleLogin = () => {
      signInWithRedirect();
    };

    return (
      <button onClick={handleLogin}>Login</button>
    );
  }

  export default Login;
