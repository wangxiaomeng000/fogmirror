const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    const response = await this.request<ApiResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<ApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request<ApiResponse>('/auth/profile');
  }

  // Session endpoints
  async createSession(title?: string) {
    return this.request<ApiResponse>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async getSessions() {
    return this.request<ApiResponse>('/sessions');
  }

  async getSession(id: string) {
    return this.request<ApiResponse>(`/sessions/${id}`);
  }

  async updateSession(id: string, title: string) {
    return this.request<ApiResponse>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
  }

  async deleteSession(id: string) {
    return this.request<ApiResponse>(`/sessions/${id}`, {
      method: 'DELETE'
    });
  }

  async exportSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions/export/all`, {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  async importSessions(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/sessions/import`, {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Import failed');
    }

    return response.json();
  }

  // Chat endpoints
  async sendMessage(content: string, sessionId?: string, image?: File) {
    const formData = new FormData();
    formData.append('content', content);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Send message failed');
    }

    return response.json();
  }

  async analyzeImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${API_BASE_URL}/chat/analyze-image`, {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }

    return response.json();
  }

  // Analysis endpoints
  async analyzeConversation(sessionId: string) {
    return this.request<ApiResponse>(`/analysis/conversation/${sessionId}`, {
      method: 'POST'
    });
  }

  async getLayerData(sessionId: string, layerType?: string) {
    const query = layerType ? `?layerType=${layerType}` : '';
    return this.request<ApiResponse>(`/analysis/layers/${sessionId}${query}`);
  }

  async getDynamicModel(sessionId: string) {
    return this.request<ApiResponse>(`/analysis/model/${sessionId}`);
  }

  async updateDynamicModel(sessionId: string, parameters: any) {
    return this.request<ApiResponse>(`/analysis/model/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ parameters })
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;