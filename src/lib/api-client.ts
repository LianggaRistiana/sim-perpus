const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();

  console.log(`[API Response] ${response.status} ${response.url}`, data);

  if (!response.ok) {
    let message = 'An error occurred';
    if (isJson && data.meta?.message) {
      message = data.meta.message;
    } else if (isJson && data.message) {
      message = data.message;
    } else if (typeof data === 'string') {
      message = data;
    }
    
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    console.log(`[API Request] GET ${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });

    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    console.log(`[API Request] POST ${endpoint}`, body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    console.log(`[API Request] PUT ${endpoint}`, body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    console.log(`[API Request] DELETE ${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers,
    });

    return handleResponse<T>(response);
  },
};
