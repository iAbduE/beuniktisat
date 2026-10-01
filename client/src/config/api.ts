// API Base URL Configuration
// Production'da bu URL kullanılacak

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://beuniktisat.com' 
  : 'http://localhost:3000';

export default API_BASE_URL;

// API URL with /api prefix
export const API_URL = `${API_BASE_URL}/api`;

// Helper function for API calls
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Helper function for image URLs
export const imageUrl = (path: string | undefined) => {
  if (!path) return '';
  if (path.startsWith('/uploads/')) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
};
