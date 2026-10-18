package com.saas.ilearning.security;

import com.saas.ilearning.common.constant.StatusConstant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Spring Security 登录主体：实现 {@link UserDetails}（框架契约）+ {@link CurrentUser}（共享只读视图）。
 *
 * <p>身份契约：equals/hashCode 只取 {@code userId}，不随会话快照字段（password/roles）漂移。</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CurrentUser implements UserDetails, Serializable {

    private static final long serialVersionUID = 1L;

    @EqualsAndHashCode.Include
    private Long userId;

    private String username;

    /**
     * 切勿输出到日志/响应（已在 toString 中排除）。
     */
    @ToString.Exclude
    private String password;

    private String realName;

    /**
     * 1=启用 0=禁用
     */
    private Integer status;

    /**
     * 角色名（会被映射为 ROLE_ 前缀的权限）。
     */
    @Builder.Default
    private List<String> roles = Collections.emptyList();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptyList();
        }
        return roles.stream()
                .filter(Objects::nonNull)
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role))
                .toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !Objects.equals(status, StatusConstant.DISABLED);
    }
}
