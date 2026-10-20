package com.saas.ilearning.vo;

import com.saas.ilearning.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * 用户信息（HTTP 出参契约，不含敏感字段）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String nickname;

    private List<String> roles;

    /**
     * 从用户实体构建（注册后返回，角色为空）。
     */
    public static UserInfoVO from(User user) {
        if (user == null) {
            return null;
        }
        return UserInfoVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .roles(Collections.emptyList())
                .build();
    }
}
