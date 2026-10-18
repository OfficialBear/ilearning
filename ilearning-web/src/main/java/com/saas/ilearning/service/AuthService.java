package com.saas.ilearning.service;

import org.springframework.security.core.Authentication;

/**
 * 身份认证服务（应用层用例）：登录认证。
 */
public interface AuthService {

    /**
     * 校验用户名与密码。
     *
     * <p>只做认证并返回 Spring Security 的 {@link Authentication}，<b>不</b>负责写入会话；
     * 会话上下文的持久化属于 Web 层职责。</p>
     *
     * @param username 用户名
     * @param password 密码
     * @return 认证通过的 Authentication
     */
    Authentication authenticate(String username, String password);
}
