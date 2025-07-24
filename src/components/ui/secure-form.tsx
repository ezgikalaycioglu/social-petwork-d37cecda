import React, { useEffect, useState } from 'react';
import { useSecurity } from '@/hooks/useSecurity';

interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSecureSubmit: (e: React.FormEvent, csrfToken: string) => void;
}

export const SecureForm: React.FC<SecureFormProps> = ({ 
  children, 
  onSecureSubmit, 
  onSubmit,
  ...props 
}) => {
  const { generateCSRFToken, validateCSRFToken } = useSecurity();
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate CSRF token when component mounts
    const token = generateCSRFToken();
    setCsrfToken(token);
    
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
  }, [generateCSRFToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CSRF token
    const storedToken = sessionStorage.getItem('csrf_token');
    if (!storedToken || !validateCSRFToken(csrfToken, storedToken)) {
      console.error('CSRF token validation failed');
      // Clear potentially compromised token
      sessionStorage.removeItem('csrf_token');
      setCsrfToken('');
      return;
    }

    // Call the secure submit handler
    onSecureSubmit(e, csrfToken);
    
    // Generate new token for next submission
    const newToken = generateCSRFToken();
    setCsrfToken(newToken);
    sessionStorage.setItem('csrf_token', newToken);
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};