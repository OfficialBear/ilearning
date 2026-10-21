package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 试题选项实体，对应 {@code question_option} 表。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    /**
     * 所属题目ID（question.id）
     */
    private Long questionId;

    /**
     * 选项标识（A/B/C...）
     */
    private String optionKey;

    /**
     * 选项内容
     */
    private String content;

    /**
     * 选项图片地址
     */
    private String imageUrl;

    /**
     * 是否正确选项：0=否 1=是
     */
    private Integer isCorrect;
}
