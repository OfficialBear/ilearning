package com.saas.ilearning.mapper;

import com.saas.ilearning.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * {@code user} 表访问入口。
 */
@Mapper
public interface UserMapper {

    /**
     * 按用户名查询用户（含密码，用于登录校验）。
     */
    User getByUsername(@Param("userName") String userName);

    /**
     * 查询用户拥有的角色名（role_name）。
     */
    List<String> getRoleNamesByUserId(@Param("userId") Long userId);

    /**
     * 新增用户（主键由数据库自增生成并经 useGeneratedKeys 回填，时间戳由数据库默认值填充）。
     */
    int insert(User user);

    /**
     * 按角色名查角色 ID；返回 null 表示该角色不存在（dml.sql 种子缺失）。
     */
    Long getRoleIdByName(@Param("roleName") String roleName);

    /**
     * 批量建立用户角色关联。
     */
    int batchInsertUserRoles(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);
}
