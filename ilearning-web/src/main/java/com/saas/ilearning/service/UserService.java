package com.saas.ilearning.service;

import com.saas.ilearning.dto.RegisterDTO;
import com.saas.ilearning.vo.UserInfoVO;

/**
 * 用户领域服务（应用层用例）：注册。
 */
public interface UserService {

    /**
     * 注册新用户：用户名查重、密码 BCrypt 加密入库（主键由数据库自增生成）、默认授予 USER 角色。
     *
     * @param registerDTO 注册参数
     * @return 新建账号信息（不含角色）
     */
    UserInfoVO register(RegisterDTO registerDTO);
}
