package com.saas.ilearning.common.constant;

/**
 * 统一提示信息常量。
 */
public final class MessageConstant {

    private MessageConstant() {
    }

    public static final String USERNAME_OR_PASSWORD_ERROR = "用户名或密码错误";
    public static final String ACCOUNT_DISABLED = "账号已被禁用";
    public static final String LOGIN_STATE_INVALID = "登录状态失效，请重新登录";
    public static final String UNAUTHENTICATED = "未登录或登录已过期";
    public static final String FORBIDDEN = "没有访问权限";
    public static final String UNKNOWN_ERROR = "未知错误";

    public static final String USERNAME_EXISTS = "用户名已存在，请更换用户名";
}
