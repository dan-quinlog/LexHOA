  import React, { useState } from 'react';
  import { signInWithRedirect } from '@aws-amplify/auth';

  function Login() {
    const [error, setError] = useState(false);

    const handleLogin = async () => {
      setError(false);
      try {
        await signInWithRedirect();
      } catch {
        setError(true);
      }
    };

    return (
      <>
        <button onClick={handleLogin}>Login</button>
        {error && <span role="alert">Unable to start sign in. Please try again.</span>}
      </>
    );
  }

  export default Login;
