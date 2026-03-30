// Helper wrapper around native fetch to automatically include the JWT token
export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    // Set headers
    const headers = new Headers(options.headers || {});

    // If not multi-part form data, explicitly set JSON
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // Attach authorization header if available
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Provide a standardized error handling approach
    if (response.status === 401 && window.location.pathname !== '/login') {
        // Token expired or invalid, auto logout handling
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
    }

    return response;
};
