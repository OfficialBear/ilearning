import axios from 'axios';
import type { ApiResult } from '@/types/api';

/**
 * 业务/网络错误。业务错误由 Result.code === -1 表示；
 * HTTP 层错误（401、网络中断等）通过 status 区分。
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: number;

  constructor(
    message: string,
    options: { status?: number; code?: number } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
  }
}

const API_BASE: string = (import.meta.env.VITE_API_BASE_URL ?? '/api')
  .replace(/\/+$/, '') || '/api';
const REQUEST_TIMEOUT_MS = 10_000;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type PathParams = Record<string, string | number>;

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
  pathParams?: PathParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

function isApiResult(payload: unknown): payload is ApiResult<unknown> {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.code === 'number' && typeof candidate.msg === 'string'
  );
}

function extractMessage(payload: unknown): string | undefined {
  if (!isApiResult(payload)) {
    return undefined;
  }
  return payload.msg.length > 0 ? payload.msg : undefined;
}

function serializeQuery(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          search.append(key, String(item));
        }
      }
      continue;
    }
    search.append(key, String(value));
  }
  return search.toString();
}

function buildPath(path: string, pathParams?: PathParams): string {
  if (!pathParams) {
    return path;
  }
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = pathParams[key];
    if (value === undefined) {
      throw new Error(`缺少路径参数: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
}

const client = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: { Accept: 'application/json' },
  paramsSerializer: {
    serialize: (params) => serializeQuery(params as QueryParams),
  },
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (!axios.isAxiosError(error)) {
    return new ApiError('未知错误');
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('请求超时，请稍后重试');
  }
  const response = error.response;
  if (!response) {
    return new ApiError('网络异常，请检查网络连接或稍后重试');
  }
  return new ApiError(
    extractMessage(response.data) ?? `请求失败（HTTP ${response.status}）`,
    { status: response.status },
  );
}

/**
 * 发起后端请求并解包 Result<T>：
 * - code === 0 → 返回 data
 * - code === -1 或 HTTP 非 2xx → 抛 ApiError（携带后端 msg）
 * 默认携带 Cookie（credentials: 'include'）。
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildPath(path, options.pathParams);

  try {
    const response = await client.request<ApiResult<T>>({
      url,
      method: options.method ?? 'GET',
      params: options.query,
      data: options.body,
      headers: options.headers,
      signal: options.signal,
      timeout: options.timeout,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = response.data;
    if (!isApiResult(payload)) {
      throw new ApiError('服务返回数据格式异常', { status: response.status });
    }

    if (payload.code !== 0) {
      throw new ApiError(
        payload.msg.length > 0 ? payload.msg : '请求失败',
        { code: payload.code },
      );
    }

    return payload.data as T;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new DOMException('请求已取消', 'AbortError');
    }
    throw toApiError(error);
  }
}

type OptionsWithoutBody = Omit<RequestOptions, 'method' | 'body'>;

export const http = {
  get: <T>(path: string, options?: OptionsWithoutBody) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: OptionsWithoutBody) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: OptionsWithoutBody) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
