/**
 * Auth util functions fr cross-component usage
 */

//& token storage & retrieval utilities fr cross-browser compatibility

/**
 * Retrieve JWT token frm avail storage methods
 * Tries localStorage, sessionStorage, & cookies in order
 */
export const getTokenFromStorage = () => {
  //~ try localStorage first
  let token = localStorage.getItem('jwt_token');

  //~ if not found, try sessionStorage
  if (!token) {
    token = sessionStorage.getItem('jwt_token');
  }

  //~ finally try cookies (fr Safari/Firefox compatibility)
  if (!token) {
    const match = document.cookie.match(new RegExp('(^| )jwt_token=([^;]+)'));
    if (match) token = match[2];
  }

  return token;
};

/**
 * Store token w cross-browser compatibility
 * Tries all available storage methods
 */
export const storeTokenToStorage = (token) => {
  try {
    localStorage.setItem('jwt_token', token);
  } catch (e) {
    console.warn('localStorage failed, trying sessionStorage', e);
    try {
      sessionStorage.setItem('jwt_token', token);
    } catch (e) {
      console.error('All storage methods failed', e);
    }
  }
  
  //~ also set as regular cookie fr Safari/Firefox
  document.cookie = `jwt_token=${token}; path=/; max-age=${60*60*24}; SameSite=Lax`;
};

/**
 * Clear token frm all storage methods
 */
export const clearTokenFromStorage = () => {
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
  document.cookie = 'jwt_token=; path=/; max-age=0';
};
