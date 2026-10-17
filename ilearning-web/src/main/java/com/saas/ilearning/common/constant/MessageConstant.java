package com.saas.ilearning.common.constant;

/**
 * 统一提示信息常量。
 */
public final class MessageConstant {

    private MessageConstant() {
    }

    public static final String USERNAME_OR_PASSWORD_ERROR = "用户名或密码错误";
    public static final String LOGIN_TOO_MANY_ATTEMPTS = "登录尝试过于频繁，请稍后再试";
    public static final String ACCOUNT_LOCKED = "账号已被禁用";
    public static final String LOGIN_STATE_INVALID = "登录状态失效，请重新登录";
    public static final String UNAUTHENTICATED = "未登录或登录已过期";
    public static final String FORBIDDEN = "没有访问权限";
    public static final String UNKNOWN_ERROR = "未知错误";

    public static final String USERNAME_EXISTS = "用户名已存在，请更换用户名";
    public static final String USER_NOT_FOUND = "账号不存在";
    public static final String STATUS_VALUE_INVALID = "账号状态不合法";
    public static final String CANNOT_MODIFY_OWN_STATUS = "不能修改自己的账号状态";
}
