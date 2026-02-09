// validations/schemas.js
import * as yup from 'yup';

export const moveSchema = yup.object({
  currentCity: yup.string().required('Current city is required'),
  targetCity: yup.string().required('Target city is required'),
  income: yup
    .number()
    .typeError('Income must be a number')
    .positive('Income must be positive')
    .required('Income is required')
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
    .transform((value, originalValue) => originalValue === '' ? null : value),

  incomeIncrease: yup
    .number()
    .typeError('Income increase must be a number')
    .min(0, 'Income increase cannot be negative')
    .max(100, 'Income increase seems unrealistic')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),

  inflationRate: yup
    .number()
    .typeError('Inflation rate must be a number')
    .min(0, 'Inflation rate cannot be negative')
    .max(100, 'Inflation rate seems unrealistic')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
});