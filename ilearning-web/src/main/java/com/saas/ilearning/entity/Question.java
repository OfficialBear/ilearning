package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 试题实体，对应 {@code question} 表（试题主表）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long questionBankId;

    /**
     * 题目类型：1=单选 2=多选 3=判断 4=简答
     */
    private Integer questionType;

    /**
     * 题目难度：1=简单 2=中等 3=困难
     */
    private Integer difficulty;

    /**
     * 题目图片地址
     */
    private String imageUrl;

    /**
     * 题目内容
     */
    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * 整题解析
     */
    private String analysis;

    /**
     * 0=禁用 1=启用
     */
    private Integer status;
}
