package com.saas.ilearning.security;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.entity.User;
import com.saas.ilearning.mapper.UserMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 从数据库加载用户并转换为 {@link CurrentUser}，供 Spring Security 认证使用。
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    public CustomUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.getByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException(MessageConstant.USERNAME_OR_PASSWORD_ERROR);
        }
        return toLoginUser(user);
    }

    private CurrentUser toLoginUser(User user) {
        List<String> roles = userMapper.getRoleCodesByUserId(user.getId());
        return CurrentUser.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .nickname(user.getNickname())
                .status(user.getStatus())
                .roles(roles == null ? List.of() : roles)
                .build();
    }
}
