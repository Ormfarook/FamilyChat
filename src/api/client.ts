import type { ApiError } from '../types';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    public payload?: unknown,
  ) {
    super(code);
  }
}

export interface ApiClient {
  request<T>(
    method: string,
    path: string,
    opts?: { body?: unknown; multipart?: FormData; skipAuth?: boolean },
  ): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  postForm<T>(path: string, form: FormData): Promise<T>;
}

export function createApiClient(config: {
  baseUrl: string;
  getToken: () => string | null;
}): ApiClient {
  const base = config.baseUrl.replace(/\/$/, '');

  async function request<T>(
    method: string,
    path: string,
    opts: { body?: unknown; multipart?: FormData; skipAuth?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {};
    const token = opts.skipAuth ? null : config.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: BodyInit | undefined;
    if (opts.multipart) {
      body = opts.multipart;
      // Do NOT set Content-Type — fetch sets it with the correct boundary.
    } else if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }

    const res = await fetch(`${base}${path}`, { method, headers, body });
    const text = await res.text();
    const parsed = text ? safeJson(text) : undefined;

    if (!res.ok) {
      const err = (parsed as ApiError | undefined)?.error ?? `http_${res.status}`;
      throw new ApiRequestError(res.status, err, parsed);
    }
    return parsed as T;
  }

  return {
    request,
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, { body }),
    patch: (path, body) => request('PATCH', path, { body }),
    postForm: (path, form) => request('POST', path, { multipart: form }),
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
