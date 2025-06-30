/**
 * Copy text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Copy text to clipboard and show success feedback
 * @param {string} text - Text to copy
 * @param {Event} event - Click event to prevent default behavior
 * @param {string} successMessage - Optional success message
 */
export const copyWithFeedback = async (text, event, successMessage = 'Copied to clipboard!') => {
  // Prevent default behavior and stop propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const success = await copyToClipboard(text);
  if (success) {
    // Show feedback by temporarily changing button style instead of text
    const button = event?.target;
    if (button) {
      const originalTitle = button.title;
      const originalStyle = button.style.cssText;
      
      button.title = 'Copied!';
      button.style.backgroundColor = '#28a745';
      button.style.color = 'white';
      
      setTimeout(() => {
        button.title = originalTitle;
        button.style.cssText = originalStyle;
      }, 1000);
    }
  }
  return success;
};
