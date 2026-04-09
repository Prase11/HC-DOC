/**
 * Get the thumbnail URL for an employee.
 * Uses the backend proxy to avoid CORS/network issues with the MYHC API.
 * 
 * @param {string|number} employeeId - The employee ID
 * @returns {string} The thumbnail URL via backend proxy
 */
export function getThumbnailUrl(employeeId) {
    if (!employeeId) return '';

    // Use the backend proxy which fetches from MYHC and caches the result
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}/api/proxy/thumbnail/${employeeId}.jpg`;
}
