package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 考试答案实体，对应 {@code exam_answer} 表。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnswer implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long examAttemptId;

    private Long paperQuestionId;

    /**
     * JSON 字符串，结构见 {@code AnswerContentVO}。
     */
    private String answerContent;

    /**
     * 客观题判题结果；简答题待人工评分时为 null。
     */
    private Boolean isCorrect;

    /**
     * 该题在试卷中的满分。
     */
    private BigDecimal score;

    /**
     * 实际得分；待人工评分时为 null。
     */
    private BigDecimal actualScore;

    private LocalDateTime answeredAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
