package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 考试记录实体，对应 {@code exam_attempt} 表：某位用户参加某场考试的一次过程。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttempt implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long examId;

    private Long userId;

    /**
     * 同一用户在同一考试中的第几次参加，从 1 开始。
     */
    private Integer attemptNo;

    /**
     * 1=进行中 2=已交卷 3=已判分 4=已取消
     */
    private Integer status;

    private BigDecimal totalScore;

    private BigDecimal passingScore;

    private BigDecimal userScore;

    private Boolean isPassed;

    private LocalDateTime startedAt;

    /**
     * 本次作答截止时间；null 表示不限制。
     */
    private LocalDateTime deadline;

    private LocalDateTime submittedAt;

    private LocalDateTime gradedAt;

    private Integer timeSpentSeconds;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
