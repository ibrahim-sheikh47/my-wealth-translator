import * as yup from 'yup';

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const signupSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .required('First name is required'),

  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .required('Last name is required'),

  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  location: yup
    .string()
    .required('Location is required'),

  phoneNumber: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Please enter a valid phone number'
    )
    .required('Phone number is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)')
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),

  profilePhoto: yup
    .mixed()
    .nullable()
    .test('fileType', 'File must be an image (JPG, PNG, GIF)', (value) => {
      if (!value) return true; // Optional
      if (value instanceof File) {
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          value.type
        );
      }
      return false;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true;
      if (value instanceof File) {
        return value.size <= 5 * 1024 * 1024; // 5MB
      }
      return false;
    }),

  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the Terms and Conditions')
    .required('You must agree to the Terms and Conditions'),
});

// ============================================
// FINANCIAL PLANNING VALIDATION SCHEMAS
// ============================================

export const moveSchema = yup.object({
  currentState: yup
    .string()
    .required('Current state is required'),

  targetState: yup
    .string()
    .required('Target state is required'),

  income: yup
    .number()
    .typeError('Income must be a number')
    .positive('Income must be positive')
    .required('Income is required'),
});

export const retirementSchema = yup.object({
  currentAge: yup
    .number()
    .typeError('Current age must be a number')
    .positive('Age must be positive')
    .integer('Age must be a whole number')
    .min(18, 'Age must be at least 18')
    .max(100, 'Age must be less than 100')
    .required('Current age is required'),

  income: yup
    .number()
    .typeError('Income must be a number')
    .positive('Income must be positive')
    .required('Income is required'),

  savings: yup
    .number()
    .typeError('Savings must be a number')
    .min(0, 'Savings cannot be negative')
    .required('Savings is required'),

  contribution: yup
    .number()
    .typeError('Contribution must be a number')
    .min(0, 'Contribution cannot be negative')
    .required('Contribution is required'),

  budget: yup
    .number()
    .typeError('Budget must be a number')
    .positive('Budget must be positive')
    .required('Budget is required'),

  retirementAge: yup
    .number()
    .typeError('Retirement age must be a number')
    .positive('Retirement age must be positive')
    .integer('Retirement age must be a whole number')
    .min(yup.ref('currentAge'), 'Retirement age must be greater than current age')
    .max(100, 'Retirement age must be less than 100')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),

  incomeIncrease: yup
    .number()
    .typeError('Income increase must be a number')
    .min(0, 'Income increase cannot be negative')
    .max(100, 'Income increase seems unrealistic')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),

  inflationRate: yup
    .number()
    .typeError('Inflation rate must be a number')
    .min(0, 'Inflation rate cannot be negative')
    .max(100, 'Inflation rate seems unrealistic')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
});

export const stocksSchema = yup.object({
  stockPlan: yup
    .string()
    .required('Stock plan is required')
    .oneOf(
      ['espp', 'rsu', 'iso', 'nso', 'sar'],
      'Please select a valid stock plan'
    ),

  nuaEligibility: yup
    .string()
    .required('NUA eligibility is required')
    .oneOf(['yes', 'no', 'not_sure'], 'Please select a valid option'),

  stockSymbol: yup
    .string()
    .required('Stock symbol is required')
    .matches(/^[A-Z]{1,5}$/, 'Stock symbol must be 1-5 uppercase letters')
    .transform((value) => value.toUpperCase()),

  grantDate: yup
    .date()
    .typeError('Please enter a valid date')
    .max(new Date(), 'Grant date cannot be in the future')
    .required('Grant date is required'),

  exerciseDate: yup
    .date()
    .typeError('Please enter a valid date')
    .min(yup.ref('grantDate'), 'Exercise date must be after grant date')
    .max(new Date(), 'Exercise date cannot be in the future')
    .required('Exercise date is required'),

  costOfShare: yup
    .number()
    .typeError('Cost of share must be a number')
    .positive('Cost of share must be positive')
    .required('Cost of share is required'),

  distributionDate: yup
    .date()
    .typeError('Please enter a valid date')
    .min(yup.ref('exerciseDate'), 'Distribution date must be after exercise date')
    .required('Distribution date is required'),

  marketValue: yup
    .number()
    .typeError('Market value must be a number')
    .positive('Market value must be positive')
    .required('Market value is required'),

  taxRate: yup
    .number()
    .typeError('Tax rate must be a number')
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .required('Tax rate is required'),

  capitalGainsRate: yup
    .number()
    .typeError('Capital gains rate must be a number')
    .min(0, 'Capital gains rate cannot be negative')
    .max(100, 'Capital gains rate cannot exceed 100%')
    .required('Capital gains rate is required'),

  transactions: yup
    .string()
    .required('Transaction type is required')
    .oneOf(
      ['none', 'exchange', 'reinvestment', 'both'],
      'Please select a valid transaction type'
    ),

  shares: yup
    .number()
    .typeError('Number of shares must be a number')
    .positive('Number of shares must be positive')
    .integer('Number of shares must be a whole number')
    .required('Number of shares is required'),
});

export const incomeSchema = yup.object({
  preTaxIncome: yup
    .number()
    .typeError('Pre-tax income must be a number')
    .positive('Pre-tax income must be positive')
    .required('Pre-tax income is required'),

  desiredAfterTaxIncome: yup
    .number()
    .typeError('Desired after-tax income must be a number')
    .positive('Desired after-tax income must be positive')
    .required('Desired after-tax income is required'),

  timeFrame: yup
    .number()
    .typeError('Time frame must be a number')
    .positive('Time frame must be positive')
    .integer('Time frame must be a whole number')
    .min(1, 'Time frame must be at least 1 year')
    .max(50, 'Time frame cannot exceed 50 years')
    .required('Time frame is required'),

  savings: yup
    .number()
    .typeError('Savings must be a number')
    .min(0, 'Savings cannot be negative')
    .required('Savings is required'),

  taxRate: yup
    .number()
    .typeError('Tax rate must be a number')
    .min(1, 'Tax rate must be at least 1%')
    .max(100, 'Tax rate cannot exceed 100%')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),

  inflationRate: yup
    .number()
    .typeError('Inflation rate must be a number')
    .min(1, 'Inflation rate must be at least 1%')
    .max(100, 'Inflation rate cannot exceed 100%')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
});

export const forgotPassSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});