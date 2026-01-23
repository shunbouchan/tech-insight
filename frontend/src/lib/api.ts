import { API_BASE_URL } from './constants';
import {
  ArticleListParams,
  ArticleListResponse,
  ArticleResponse,
  SearchParams,
  SearchResponse,
} from '@/types/api';
import { ArticleCreateInput, ArticleUpdateInput } from '@/types/article';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(typeof error.detail === 'string' ? error.detail : 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  articles = {
    list: async (params: ArticleListParams = {}): Promise<ArticleListResponse> => {
      const queryString = this.buildQueryString(params);
      const endpoint = queryString ? `/articles?${queryString}` : '/articles';
      return this.request<ArticleListResponse>(endpoint);
    },

    get: async (id: number): Promise<ArticleResponse> => {
      return this.request<ArticleResponse>(`/articles/${id}`);
    },

    create: async (data: ArticleCreateInput): Promise<ArticleResponse> => {
      return this.request<ArticleResponse>('/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: ArticleUpdateInput): Promise<ArticleResponse> => {
      return this.request<ArticleResponse>(`/articles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number): Promise<void> => {
      return this.request<void>(`/articles/${id}`, {
        method: 'DELETE',
      });
    },
  };

  search = async (params: SearchParams): Promise<SearchResponse> => {
    const queryString = this.buildQueryString(params);
    return this.request<SearchResponse>(`/search?${queryString}`);
  };
}

export const api = new ApiClient(API_BASE_URL);
