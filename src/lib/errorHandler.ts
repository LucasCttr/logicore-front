/**
 * Extracts user-friendly error messages from axios errors
 */
export function getErrorMessage(error: any): string {
  // If it's an axios error with response data
  if (error?.response?.data) {
    const data = error.response.data;

    // Handle domain validation errors (e.g., business rule violations)
    if (data.errors && typeof data.errors === 'object') {
      // Try to get the first error message from any error category
      const errorCategories = Object.values(data.errors) as any[];
      if (Array.isArray(errorCategories[0])) {
        return errorCategories[0][0];
      }
      if (typeof errorCategories[0] === 'string') {
        return errorCategories[0];
      }
    }

    // Handle title + message structure
    if (data.title && data.message) {
      return `${data.title}: ${data.message}`;
    }

    // Handle just message
    if (data.message) {
      return data.message;
    }

    // Handle title only (as fallback)
    if (data.title) {
      return data.title;
    }
  }

  // Standard error message
  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
