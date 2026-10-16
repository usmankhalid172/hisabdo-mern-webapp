export const getFriendlyErrorMessage = (rawError: any): string => {
  if (!rawError) return 'An unexpected error occurred.';

  const errorStr = typeof rawError === 'string' 
    ? rawError 
    : (rawError.message || rawError.code || '');

  if (
    errorStr.includes('Invalid login credentials') || 
    errorStr.includes('invalid_credentials') ||
    errorStr.includes('User not found') ||
    errorStr.includes('Invalid credentials') ||
    errorStr === 'Invalid credentials'
  ) {
    return 'Email or Password is incorrect';
  }

  if(
    errorStr.includes('User already registered') || 
    errorStr.includes('email_taken') ||
    errorStr.includes('already in use') ||
    errorStr.includes('Registration failed') ||
    errorStr.toLowerCase().includes('already')
  )  {
    return 'This email address is already in use.';
  }

  if (errorStr.includes('Network Error') || errorStr.includes('fetch failed')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  if (errorStr.includes('rate limit') || errorStr.includes('too many requests')) {
    return 'Too many attempts. Please try again later.';
  }

  return 'Email or Password is incorrect.';
};
