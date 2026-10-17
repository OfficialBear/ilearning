package com.saas.ilearning.common.exception;

/**
 * 业务异常基类：被 {@code GlobalExceptionHandler} 捕获并转换为统一返回结构。
 */
public class BaseException extends RuntimeException {

    public BaseException() {
    }

    public BaseException(String msg) {
        super(msg);
    }

    public BaseException(String msg, Throwable cause) {
        super(msg, cause);
    }
}
