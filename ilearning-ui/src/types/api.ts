/**
 * 后端 HTTP 出参契约：与 ilearning-web 的 com.saas.ilearning.common.result.Result 对应。
 */
export interface ApiResult<T> {
  /** 0: success, -1: failure */
  code: number;
  msg: string;
  data?: T;
}

/**
 * 当前登录用户信息（对应后端 UserInfoVO，不含敏感字段）。
 */
export interface UserInfo {
  id: number;
  userName: string;
  realName: string | null;
  roles: string[] | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}
