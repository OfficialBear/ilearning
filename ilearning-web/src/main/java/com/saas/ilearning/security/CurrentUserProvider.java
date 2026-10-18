package com.saas.ilearning.security;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.exception.BaseException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;

/**
 * 当前请求登录用户的统一访问入口。
 *
 * <p>基于 Spring Security 的 {@code SecurityContext}（内部为 ThreadLocal，请求结束由框架清理），
 * 因此无需自行维护 ThreadLocal。业务代码通过静态方法读取当前用户。</p>
 */
public final class CurrentUserProvider {

    private static final SecurityContextHolderStrategy STRATEGY =
            SecurityContextHolder.getContextHolderStrategy();

    private CurrentUserProvider() {
    }

    /**
     * 获取当前登录用户；未登录或主体类型不符时返回 {@code null}。
     */
    public static CurrentUser getCurrentUser() {
        Authentication authentication = STRATEGY.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        return principal instanceof CurrentUser currentUser ? currentUser : null;
    }

    /**
     * 获取当前登录用户；未登录时抛出业务异常（交由全局异常处理）。
     */
    public static CurrentUser requireCurrentUser() {
        CurrentUser currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new BaseException(MessageConstant.LOGIN_STATE_INVALID);
        }
        return currentUser;
    }
}
