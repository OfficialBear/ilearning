package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

/**
 * {@link AuthService} 默认实现：认证委托 Spring Security {@link AuthenticationManager}。
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication authenticate(String username, String password) {
        try {
            return authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(username, password));
        } catch (DisabledException ex) {
            throw new BaseException(MessageConstant.ACCOUNT_DISABLED);
        } catch (AuthenticationException ex) {
            throw new BaseException(MessageConstant.USERNAME_OR_PASSWORD_ERROR);
        }
    }
}
