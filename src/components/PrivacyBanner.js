import React, { useState } from 'react';
import './PrivacyBanner.css';

const STORAGE_KEY = 'lexhoa_privacy_ack';
const PRIVACY_POLICY_URL = `${process.env.PUBLIC_URL || ''}/privacy-policy.pdf`;

const PrivacyBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors (e.g., private browsing); banner still dismisses for the session.
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="privacy-banner" role="region" aria-label="Privacy notice">
      <p className="privacy-banner-text">
        We use only the cookies necessary to operate this site and to keep you
        securely signed in. We never sell your information. See our{' '}
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="privacy-banner-link"
        >
          Privacy Policy
        </a>{' '}
        for details.
      </p>
      <button
        type="button"
        className="privacy-banner-button"
        onClick={handleDismiss}
      >
        Got it
      </button>
    </div>
  );
};

export default PrivacyBanner;
