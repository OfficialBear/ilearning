import { http } from '@/utils/request';
import type { LoginPayload, UserInfo } from '@/types/api';

/** 登录：成功后后端下发会话 Cookie（HttpOnly）。 */
export function loginRequest(payload: LoginPayload): Promise<UserInfo> {
  return http.post<UserInfo>('/auth/login', payload);
}

/** 当前登录用户：未登录时后端返回 401 + Result 错误，由调用方处理。 */
export function fetchProfile(): Promise<UserInfo> {
  return http.get<UserInfo>('/auth/profile');
}

/** 登出：服务端失效会话并清除 Cookie。 */
export function logoutRequest(): Promise<void> {
  return http.post<void>('/auth/logout');
}
