package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.LoginDTO;
import com.saas.ilearning.dto.RegisterDTO;
import com.saas.ilearning.security.CurrentUser;
import com.saas.ilearning.security.CurrentUserProvider;
import com.saas.ilearning.service.AuthService;
import com.saas.ilearning.service.UserService;
import com.saas.ilearning.vo.UserInfoVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 身份认证接口：登录 / 注册 / 登出 / 当前用户。
 *
 * <p>基于 Session + HttpOnly Cookie：登录成功后写入 {@code HttpSession}，容器自动下发 JSESSIONID。</p>
 */
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
    private final CookieClearingLogoutHandler cookieClearingLogoutHandler =
            new CookieClearingLogoutHandler("JSESSIONID");

    public AuthController(AuthService authService,
                          UserService userService,
                          SecurityContextRepository securityContextRepository) {
        this.authService = authService;
        this.userService = userService;
        this.securityContextRepository = securityContextRepository;
    }

    /**
     * 注册：创建新账号（用户名唯一），注册成功后需自行登录。
     */
    @PostMapping("/register")
    public Result<UserInfoVO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return Result.success(userService.register(registerDTO));
    }

    /**
     * 登录：认证成功后把 SecurityContext 持久化到 HttpSession。
     */
    @PostMapping("/login")
    public Result<UserInfoVO> login(@Valid @RequestBody LoginDTO loginDTO,
                                    HttpServletRequest request,
                                    HttpServletResponse response) {
        log.info("用户登录：{}", loginDTO.getUsername());

        // 1、认证（失败会抛出业务异常）
        Authentication authentication = authService.authenticate(loginDTO.getUsername(), loginDTO.getPassword());

        // 2、防会话固定：登录时丢弃旧会话，随后持久化新上下文（新 sessionId）
        HttpSession existingSession = request.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }

        // 3、写入 SecurityContext 并持久化到 HttpSession
        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return Result.success(toUserInfo((CurrentUser) authentication.getPrincipal()));
    }

    /**
     * 登出：失效会话、清除上下文与会话 Cookie。
     */
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        logoutHandler.logout(request, response, authentication);
        cookieClearingLogoutHandler.logout(request, response, authentication);
        return Result.success();
    }

    /**
     * 当前登录用户。
     */
    @GetMapping("/profile")
    public Result<UserInfoVO> currentUser() {
        return Result.success(toUserInfo(CurrentUserProvider.requireCurrentUser()));
    }

    private static UserInfoVO toUserInfo(CurrentUser currentUser) {
        return UserInfoVO.builder()
                .id(currentUser.getUserId())
                .userName(currentUser.getUsername())
                .realName(currentUser.getRealName())
                .roles(currentUser.getRoles())
                .build();
    }
}
