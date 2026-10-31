package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 交卷后的成绩单：包含逐题得分、正确答案与解析。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long attemptId;

    private Long examId;

    private String examTitle;

    private Integer attemptNo;

    /**
     * 2=已交卷待人工评分 3=已判分
     */
    private Integer status;

    private BigDecimal userScore;

    private BigDecimal totalScore;

    private BigDecimal passingScore;

    private Boolean isPassed;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer timeSpentSeconds;

    private Boolean pendingManualGrading;

    private List<AttemptResultQuestionVO> questions;
}
