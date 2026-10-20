package com.saas.ilearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 注册请求参数（HTTP 入参契约）。
 */
@Data
public class RegisterDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 64, message = "用户名长度需在 3~64 位之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度需在 6~20 位之间")
    private String password;

    /**
     * 昵称，可选。
     */
    @Size(max = 64, message = "昵称最长 64 位")
    private String nickname;
}
