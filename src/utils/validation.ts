
// Email validation regex pattern (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// URL validation regex pattern
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/;

// Phone number regex (supports various formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Approved business categories
export const APPROVED_BUSINESS_CATEGORIES = [
  'Groomer',
  'Pet Store',
  'Trainer',
  'Veterinarian',
  'Boarding',
  'Daycare',
  'Pet Sitter',
  'Pet Photography',
  'Other'
] as const;

export type BusinessCategory = typeof APPROVED_BUSINESS_CATEGORIES[number];

// Input length limits
export const INPUT_LIMITS = {
  BUSINESS_NAME: { min: 1, max: 100 },
  EMAIL: { min: 5, max: 254 },
  ADDRESS: { min: 0, max: 200 },
  PHONE: { min: 0, max: 20 },
  WEBSITE: { min: 0, max: 200 },
  DESCRIPTION: { min: 0, max: 1000 },
  DEAL_TITLE: { min: 1, max: 100 },
  DEAL_DESCRIPTION: { min: 1, max: 500 },
  DEAL_TERMS: { min: 0, max: 500 }
} as const;

// Sanitization function to remove potentially harmful characters
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .replace(/[\x00-\x1f\x7f-\x9f]/g, ''); // Remove control characters
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(email);
  
  if (!sanitized) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (sanitized.length < INPUT_LIMITS.EMAIL.min || sanitized.length > INPUT_LIMITS.EMAIL.max) {
    return { isValid: false, error: `Email must be between ${INPUT_LIMITS.EMAIL.min} and ${INPUT_LIMITS.EMAIL.max} characters` };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Business name validation
export const validateBusinessName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Business name is required' };
  }
  
  if (sanitized.length < INPUT_LIMITS.BUSINESS_NAME.min || sanitized.length > INPUT_LIMITS.BUSINESS_NAME.max) {
    return { isValid: false, error: `Business name must be between ${INPUT_LIMITS.BUSINESS_NAME.min} and ${INPUT_LIMITS.BUSINESS_NAME.max} characters` };
  }
  
  return { isValid: true };
};

// Address validation
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(address);
  
  if (sanitized.length > INPUT_LIMITS.ADDRESS.max) {
    return { isValid: false, error: `Address must be less than ${INPUT_LIMITS.ADDRESS.max} characters` };
  }
  
  return { isValid: true };
};

// Phone validation
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(phone);
  
  if (!sanitized) {
    return { isValid: true }; // Phone is optional
  }
  
  if (sanitized.length > INPUT_LIMITS.PHONE.max) {
    return { isValid: false, error: `Phone number must be less than ${INPUT_LIMITS.PHONE.max} characters` };
  }
  
  // Remove spaces, dashes, parentheses for validation
  const cleanPhone = sanitized.replace(/[\s\-\(\)]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

// Website URL validation
export const validateWebsite = (website: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(website);
  
  if (!sanitized) {
    return { isValid: true }; // Website is optional
  }
  
  if (sanitized.length > INPUT_LIMITS.WEBSITE.max) {
    return { isValid: false, error: `Website URL must be less than ${INPUT_LIMITS.WEBSITE.max} characters` };
  }
  
  if (!URL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid website URL (must start with http:// or https://)' };
  }
  
  return { isValid: true };
};

// Business category validation
export const validateBusinessCategory = (category: string): { isValid: boolean; error?: string } => {
  if (!category) {
    return { isValid: false, error: 'Business category is required' };
  }
  
  if (!APPROVED_BUSINESS_CATEGORIES.includes(category as BusinessCategory)) {
    return { isValid: false, error: 'Please select a valid business category' };
  }
  
  return { isValid: true };
};

// Description validation
export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(description);
  
  if (sanitized.length > INPUT_LIMITS.DESCRIPTION.max) {
    return { isValid: false, error: `Description must be less than ${INPUT_LIMITS.DESCRIPTION.max} characters` };
  }
  
  return { isValid: true };
};

// Deal title validation
export const validateDealTitle = (title: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(title);
  
  if (!sanitized) {
    return { isValid: false, error: 'Deal title is required' };
  }
  
  if (sanitized.length < INPUT_LIMITS.DEAL_TITLE.min || sanitized.length > INPUT_LIMITS.DEAL_TITLE.max) {
    return { isValid: false, error: `Deal title must be between ${INPUT_LIMITS.DEAL_TITLE.min} and ${INPUT_LIMITS.DEAL_TITLE.max} characters` };
  }
  
  return { isValid: true };
};

// Deal description validation
export const validateDealDescription = (description: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(description);
  
  if (!sanitized) {
    return { isValid: false, error: 'Deal description is required' };
  }
  
  if (sanitized.length < INPUT_LIMITS.DEAL_DESCRIPTION.min || sanitized.length > INPUT_LIMITS.DEAL_DESCRIPTION.max) {
    return { isValid: false, error: `Deal description must be between ${INPUT_LIMITS.DEAL_DESCRIPTION.min} and ${INPUT_LIMITS.DEAL_DESCRIPTION.max} characters` };
  }
  
  return { isValid: true };
};

// Deal terms validation
export const validateDealTerms = (terms: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(terms);
  
  if (sanitized.length > INPUT_LIMITS.DEAL_TERMS.max) {
    return { isValid: false, error: `Deal terms must be less than ${INPUT_LIMITS.DEAL_TERMS.max} characters` };
  }
  
  return { isValid: true };
};

// Comprehensive validation for business profile
export const validateBusinessProfile = (data: {
  business_name: string;
  email: string;
  address: string;
  business_category: string;
  description: string;
  phone: string;
  website: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const businessNameValidation = validateBusinessName(data.business_name);
  if (!businessNameValidation.isValid) {
    errors.business_name = businessNameValidation.error!;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error!;
  }
  
  const categoryValidation = validateBusinessCategory(data.business_category);
  if (!categoryValidation.isValid) {
    errors.business_category = categoryValidation.error!;
  }
  
  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error!;
  }
  
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }
  
  const websiteValidation = validateWebsite(data.website);
  if (!websiteValidation.isValid) {
    errors.website = websiteValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
