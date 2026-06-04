import type { ApiErrorBody, ApiSuccess } from '@contracts/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: ApiErrorBody['details'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  authToken?: string | null;
}

export class ApiClient {
  constructor(private readonly baseUrl: string = API_BASE) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, authToken, headers, ...init } = options;

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    const json: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = json as ApiErrorBody;
      throw new ApiError(
        err.error ?? response.statusText,
        response.status,
        err.code ?? 'UNKNOWN',
        err.details,
      );
    }

    const success = json as ApiSuccess<T>;
    if (success && typeof success === 'object' && 'ok' in success && success.ok === true) {
      return success.data;
    }

    return json as T;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }
}

export const apiClient = new ApiClient();
