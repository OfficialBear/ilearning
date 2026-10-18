/**
 * 后端 HTTP 出参契约：与 ilearning-web 的 com.saas.ilearning.common.result.Result 对应。
 */
export interface ApiResult<T> {
  /** 0: success, -1: failure */
  code: number;
  msg: string;
  data?: T;
}
