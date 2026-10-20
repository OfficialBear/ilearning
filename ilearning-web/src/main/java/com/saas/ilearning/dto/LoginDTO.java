package com.saas.ilearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 登录请求参数（HTTP 入参契约）。
 *
 * <p>上限与 {@link RegisterDTO} 对齐：超长 username 会以 DB 参数形态
 * 全程连带放大，password 超 72 字节还会命中 BCrypt encode 的硬限制。</p>
 */
@Data
public class LoginDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "用户名不能为空")
    @Size(max = 64, message = "用户名最长 64 位")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(max = 20, message = "密码最长 20 位")
    private String password;

}
