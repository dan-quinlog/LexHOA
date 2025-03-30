import { getCurrentUser, updateUserAttributes, confirmUserAttribute, sendUserAttributeVerificationCode } from '@aws-amplify/auth';

/**
 * Update user attributes in Cognito
 * @param {Object} attributes - Key-value pairs of attributes to update
 * @returns {Promise} - Result of the update operation
 */
export const updateCognitoUserAttributes = async (attributes) => {
  try {
    // Get current authenticated user
    await getCurrentUser();
    
    // Update user attributes
    return await updateUserAttributes({ userAttributes: attributes });
  } catch (error) {
    console.error("Error updating Cognito user attributes:", error);
    throw error;
  }
};

/**
 * Verify the new email address
 * @param {string} verificationCode - The verification code sent to the new email
 * @returns {Promise} - Result of the verification operation
 */
export const verifyNewEmail = async (verificationCode) => {
  try {
    return await confirmUserAttribute({
      userAttributeKey: 'email',
      confirmationCode: verificationCode
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

/**
 * Request a verification code for email verification
 * @returns {Promise} - Result of the request operation
 */
export const requestEmailVerificationCode = async () => {
  try {
    return await sendUserAttributeVerificationCode({
      userAttributeKey: 'email'
    });
  } catch (error) {
    console.error("Error requesting verification code:", error);
    throw error;
  }
};
