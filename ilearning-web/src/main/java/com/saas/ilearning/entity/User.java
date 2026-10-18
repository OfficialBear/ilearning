package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户实体，对应 {@code user} 表。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    /**
     * user_name
     */
    private String userName;

    /**
     * real_name
     */
    private String realName;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private String password;

    /**
     * 1=启用 0=禁用
     */
    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
