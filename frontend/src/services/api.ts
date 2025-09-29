const API_BASE_URL = 'http://localhost:3000/api';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    walletAddress: string;
  };
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  type: string;
  status: string;
  totalValue: number;
  totalShares: number;
  pricePerShare: number;
  availableShares: number;
  minimumInvestment: number;
  tokenSymbol: string;
  metrics: {
    monthlyRent: number;
    annualYield: number;
    occupancyRate: number;
    squareFootage: number;
    yearBuilt: number;
    bedrooms: number;
    bathrooms: number;
  };
  images: string[];
}

interface Position {
  id: string;
  property: Property;
  shares: number;
  averagePrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedGain: number;
  realizedGain: number;
}

export class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProperties(): Promise<Property[]> {
    return this.request('/properties');
  }

  async getProperty(id: string): Promise<Property> {
    return this.request(`/properties/${id}`);
  }

  async getPortfolio(): Promise<Position[]> {
    const response = await this.request('/portfolio');
    return response.positions || [];
  }

  async createOrder(propertyId: string, shares: number, type: 'buy' | 'sell') {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        quantity: shares, // Backend expects 'quantity'
        type,
        price: 50, // Using fixed price for MVP
      }),
    });
  }

  logout() {
    this.clearToken();
  }
}

export const api = new ApiService();