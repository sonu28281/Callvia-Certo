/**
 * Validation Utilities
 * 
 * Reduces code duplication for common validation patterns
 * Provides clear, reusable validation functions
 */

import { errors } from './error-handler';

/**
 * Validate required fields exist in object
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): void {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw errors.missingField(String(field));
    }
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName = 'email'): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw errors.invalidFormat(fieldName, 'valid email address');
  }
}

/**
 * Validate phone number format (Indian)
 */
export function validatePhone(phone: string, fieldName = 'phone'): void {
  // Allow formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw errors.invalidFormat(fieldName, 'valid Indian phone number');
  }
}

/**
 * Validate Aadhaar number format
 */
export function validateAadhaar(aadhaar: string, fieldName = 'aadhaar'): void {
  // Remove spaces and check for 12 digits
  const cleaned = aadhaar.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    throw errors.invalidFormat(fieldName, '12-digit Aadhaar number');
  }
}

/**
 * Validate array is not empty
 */
export function validateNotEmpty<T>(
  array: T[],
  fieldName: string
): void {
  if (!array || array.length === 0) {
    throw errors.validation(`${fieldName} cannot be empty`);
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value.length < min) {
    throw errors.validation(
      `${fieldName} must be at least ${min} characters`,
      { min, max, actual: value.length }
    );
  }
  if (value.length > max) {
    throw errors.validation(
      `${fieldName} must be at most ${max} characters`,
      { min, max, actual: value.length }
    );
  }
}

/**
 * Validate number is in range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw errors.validation(
      `${fieldName} must be between ${min} and ${max}`,
      { min, max, actual: value }
    );
  }
}

/**
 * Validate value is one of allowed options
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string
): void {
  if (!allowedValues.includes(value)) {
    throw errors.validation(
      `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`,
      { allowed: allowedValues, received: value }
    );
  }
}

/**
 * Validate object has specific structure
 */
export function validateObject(
  value: any,
  fieldName: string
): asserts value is Record<string, any> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw errors.validation(`${fieldName} must be an object`);
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName = 'url'): void {
  try {
    new URL(url);
  } catch {
    throw errors.invalidFormat(fieldName, 'valid URL');
  }
}

/**
 * Validate UUID format
 */
export function validateUuid(uuid: string, fieldName = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw errors.invalidFormat(fieldName, 'valid UUID');
  }
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[{}]/g, ''); // Remove braces
}

/**
 * Validate and parse JSON string
 */
export function validateJson(jsonString: string, fieldName = 'data'): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    throw errors.invalidFormat(fieldName, 'valid JSON');
  }
}
