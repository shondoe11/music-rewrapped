import axios from 'axios';

import { getTokenFromStorage } from './context/AuthUtils';

const BASE_URL = import.meta.env.VITE_BASE_URL;

//& cross-browser token retrieval function - now uses shared util
const getToken = getTokenFromStorage;

//& axios instance w default config fr consistent usage
const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

//& req interceptor fr auth tokens / other request processing
apiClient.interceptors.request.use(
    config => {
        //~ auth headers
        const token = getToken(); //~ cross-browser compatible method
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        //~ handle req prep errors
        console.error('Request preparation error:', error);
        return Promise.reject(error);
    }
);

//& response interceptor fr centralized error handling
apiClient.interceptors.response.use(
    //~ success res handler - just pass through
    response => response,

    //~ err res handler - enhance errors w context
    error => {
        //~ enhanced err obj w better context
        const enhancedError = new Error(
            error.response?.data?.error ||
            error.message ||
            'An unexpected error occurred'
        );

        //~ preserve impt err information fr users
        enhancedError.status = error.response?.status;
        enhancedError.originalError = error;
        enhancedError.response = error.response;
        enhancedError.isApiError = true;

        //& handle specific err cases
        if (error.response?.status === 401) {
            enhancedError.isAuthError = true;
            //~ trigger auth-related side effects here if need
        }

        //~ preserve stack trace fr debugging
        if (error.stack) {
            enhancedError.stack = error.stack;
        }

        //~ log errs in development but not production
        if (import.meta.env.DEV) {
            console.error('API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
                message: enhancedError.message
            });
        }

        return Promise.reject(enhancedError);
    }
);

export default apiClient;