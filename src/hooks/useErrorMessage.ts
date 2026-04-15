/**
 * Hook for getting user-friendly error message from axios errors
 * Extracts messages from error responses automatically
 */
export function useErrorMessage() {
  const getErrorMessage = (error: any): string => {
    // Use the userMessage added by axios interceptor
    if (error?.userMessage) {
      return error.userMessage;
    }

    // Fallback if error doesn't have userMessage
    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred';
  };

  return { getErrorMessage };
}
