package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.RoleConstant;
import com.saas.ilearning.common.constant.StatusConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.dto.RegisterDTO;
import com.saas.ilearning.entity.User;
import com.saas.ilearning.mapper.UserMapper;
import com.saas.ilearning.service.UserService;
import com.saas.ilearning.vo.UserInfoVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link UserService} 默认实现：注册基于 {@link UserMapper}。
 */
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserMapper userMapper,
                           PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserInfoVO register(RegisterDTO registerDTO) {
        String username = registerDTO.getUsername().trim();
        if (userMapper.getByUsername(username) != null) {
            throw new BaseException(MessageConstant.USERNAME_EXISTS);
        }

        User user = User.builder()
                .userName(username)
                .realName(registerDTO.getRealName() == null ? "" : registerDTO.getRealName().trim())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .status(StatusConstant.ENABLED)
                .build();
        try {
            userMapper.insert(user);
        } catch (DuplicateKeyException ex) {
            // 注册并发窗口下用户名查重可能穿透，由 uk_username 唯一索引兜底
            log.warn("register duplicate username: {}", username);
            throw new BaseException(MessageConstant.USERNAME_EXISTS);
        }

        // 默认 USER 角色：不写则新用户 getAuthorities() 为空，任何 hasRole('USER') 接口直接 403
        Long userRoleId = userMapper.getRoleIdByName(RoleConstant.USER);
        if (userRoleId == null) {
            throw new IllegalStateException("role '" + RoleConstant.USER + "' missing in table `role` (dml.sql seed not applied)");
        }
        userMapper.batchInsertUserRoles(user.getId(), List.of(userRoleId));

        log.info("用户注册成功：{}（id={}，默认角色 {}）", username, user.getId(), RoleConstant.USER);
        return UserInfoVO.from(user);
    }
}
