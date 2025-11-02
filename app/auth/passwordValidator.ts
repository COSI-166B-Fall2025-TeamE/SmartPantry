const validatePassword = (password: string): { isValid: boolean; errorMessage: string } => {
  const errors: string[] = [];
  
  // Check length of the password (at least 8 digits)
  if (password.length < 8) {
    errors.push('at least 8 characters long');
  }
  
  // Check if the password contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('an uppercase letter');
  }
  
  // Check if the password contains at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('a lowercase letter');
  }
  
  // Check if the password contains at least one number
  if (!/[0-9]/.test(password)) {
    errors.push('a number');
  }
  
  // Check if the password contains at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('a special character');
  }
  
  // Return result
  if (errors.length > 0) {
    // Remove duplicates
    const uniqueErrors = [...new Set(errors)];
    
    return {
      isValid: false,
      errorMessage: `Passwords should be and contain at least:\n\n${uniqueErrors.map(error => `- ${error}`).join('\n')}`
    };
  }
  
  // All checks passed
  return {
    isValid: true,
    errorMessage: ''
  };
};

export default validatePassword;