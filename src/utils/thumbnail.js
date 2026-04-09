/**
 * Get the thumbnail URL for an employee.
 * 
 * Uses the MYHC API directly — this works when the user's browser
 * is on the GMF internal network. When outside the network, the image
 * will fail to load and the fallback initials avatar will be shown.
 * 
 * All components use this centralized function so the URL format
 * can be changed in one place if MYHC API changes.
 * 
 * @param {string|number} employeeId - The employee ID
 * @returns {string} The thumbnail URL
 */
export function getThumbnailUrl(employeeId) {
    if (!employeeId) return '';
    return `https://api-myhc.gmf-aeroasia.co.id/thumbnail/${employeeId}.jpg`;
}
