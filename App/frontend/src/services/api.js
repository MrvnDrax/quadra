const API_BASE_URL = 'http://localhost:8000';

class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      
      throw new APIError(
        errorData.detail || `HTTP Error ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    throw new APIError('Error de conexión con el servidor', 0, null);
  }
}

export const authAPI = {
  async register(userData) {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('password', userData.password);
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    return apiRequest('/register', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  async login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiRequest('/login', {
      method: 'POST',
      headers: {},
      body: formData,
    });

    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
  },

  async getCurrentUser() {
    try {
      return await apiRequest('/me');
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        this.logout();
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  }
};

export const placesAPI = {
  async getPlaces(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radius) params.append('radius', filters.radius);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = queryString ? `/places/?${queryString}` : '/places/';
    
    return apiRequest(endpoint);
  },

  async getPlace(placeId) {
    return apiRequest(`/places/${placeId}`);
  },

  async createPlace(placeData) {
    return apiRequest('/places/', {
      method: 'POST',
      body: JSON.stringify(placeData),
    });
  },

  async updatePlace(placeId, placeData) {
    return apiRequest(`/places/${placeId}`, {
      method: 'PUT',
      body: JSON.stringify(placeData),
    });
  },

  async deletePlace(placeId) {
    return apiRequest(`/places/${placeId}`, {
      method: 'DELETE',
    });
  },

  async getCategories() {
    return apiRequest('/places/categories/');
  },

  async createReview(placeId, reviewData) {
    return apiRequest(`/places/${placeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  async getPlaceReviews(placeId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/places/${placeId}/reviews?${queryString}` 
      : `/places/${placeId}/reviews`;
    
    return apiRequest(endpoint);
  }
};

export { APIError };

export function createApiHook() {
  return {
    loading: false,
    error: null,
    data: null,
    
    async execute(apiCall) {
      this.loading = true;
      this.error = null;
      
      try {
        this.data = await apiCall();
        return this.data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  };
}
