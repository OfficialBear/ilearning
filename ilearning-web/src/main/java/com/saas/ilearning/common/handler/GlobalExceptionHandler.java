package com.saas.ilearning.common.handler;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理：保持响应结构统一，且不向外暴露堆栈信息。
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 权限不足时原样重抛，交由安全过滤器链的 AccessDeniedHandler 处理（避免被兜底
     * handler 吞掉后以 200/未知错误返回，保证 403 语义）。
     */
    @ExceptionHandler(AccessDeniedException.class)
    public void rethrowAccessDeniedException(AccessDeniedException ex) {
        throw ex;
    }

    /**
     * 业务异常。
     */
    @ExceptionHandler(BaseException.class)
    public Result<Void> handleBaseException(BaseException ex) {
        log.warn("business ex: {}", ex.getMessage());
        return Result.error(ex.getMessage());
    }

    /**
     * 参数校验失败（@Valid）。
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidationException(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : MessageConstant.UNKNOWN_ERROR;
        log.warn("validation ex: {}", message);
        return Result.error(message);
    }

    /**
     * 兜底：未预期异常。
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception ex) {
        log.error("unexpected ex: {}", ex.getMessage(), ex);
        return Result.error(MessageConstant.UNKNOWN_ERROR);
    }
}
