import { useSyncExternalStore } from 'react';
import { fetchProfile, loginRequest, logoutRequest } from '@/services/auth';
import type { LoginPayload, UserInfo } from '@/types/api';
import { ApiError, setUnauthorizedHandler } from '@/utils/request';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: UserInfo | null;
}

let state: AuthState = { status: 'loading', user: null };
const listeners = new Set<() => void>();

function setState(next: AuthState): void {
  state = next;
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return state;
}

let bootstrapped = false;
let requestInFlight = false;

setUnauthorizedHandler(() => {
  if (state.status !== 'unauthenticated') {
    setState({ status: 'unauthenticated', user: null });
  }
});

/** 应用启动时恢复会话：依据 /auth/profile 判定登录态。 */
export function bootstrapAuth(force = false): void {
  if (requestInFlight || (bootstrapped && !force)) {
    return;
  }
  bootstrapped = true;
  requestInFlight = true;
  setState({ status: 'loading', user: null });
  fetchProfile()
    .then((user) => {
      setState({ status: 'authenticated', user });
    })
    .catch((cause: unknown) => {
      if (cause instanceof ApiError && cause.status === 401) {
        setState({ status: 'unauthenticated', user: null });
        return;
      }
      setState({ status: 'error', user: null });
    })
    .finally(() => {
      requestInFlight = false;
    });
}

/** 会话恢复失败后的手动重试。 */
export function retryBootstrap(): void {
  bootstrapAuth(true);
}

export async function login(payload: LoginPayload): Promise<UserInfo> {
  const user = await loginRequest(payload);
  setState({ status: 'authenticated', user });
  return user;
}

export async function logout(): Promise<void> {
  try {
    await logoutRequest();
  } catch (cause) {
    if (!(cause instanceof ApiError && cause.status === 401)) {
      throw cause;
    }
  } finally {
    // 会话已过期时登出是幂等的；本地状态始终清除，其他异常交给调用方提示。
    setState({ status: 'unauthenticated', user: null });
  }
}

/** 组件内订阅登录态。 */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
