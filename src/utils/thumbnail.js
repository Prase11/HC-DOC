/**
 * Get the thumbnail URL for an employee.
 * 
 * Uses the backend proxy at /api/proxy/thumbnail/ which fetches the image
 * from the MYHC API server-side. This works from any network because
 * the server (which is on the GMF network) handles the actual API call.
 * 
 * If the proxy fails, the frontend fallback (initials avatar) will be shown.
 * 
 * All components use this centralized function so the URL format
 * can be changed in one place.
 * 
 * @param {string|number} employeeId - The employee ID
 * @returns {string} The thumbnail URL
 */
export function getThumbnailUrl(employeeId) {
    if (!employeeId) return '';
    return `/api/proxy/thumbnail/${employeeId}.jpg`;
}
