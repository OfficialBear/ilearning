package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 试卷实体，对应 {@code paper} 表。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paper implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String title;

    private String description;

    /**
     * 试卷满分，应等于所有试卷题目分值之和。
     */
    private BigDecimal totalScore;

    /**
     * 0=草稿 1=已发布 2=已归档
     */
    private Integer status;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
