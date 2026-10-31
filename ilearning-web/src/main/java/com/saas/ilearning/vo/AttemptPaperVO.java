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
 * 作答页面数据：考试规则、截止时间与不含答案的试卷题目。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptPaperVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long attemptId;

    private Long examId;

    private String examTitle;

    private String examDescription;

    private Integer attemptNo;

    private LocalDateTime startedAt;

    private LocalDateTime deadline;

    /**
     * 截止时间的绝对毫秒值，供前端做时钟无关的倒计时。
     */
    private Long deadlineMillis;

    private Long serverTimeMillis;

    private Integer durationMinutes;

    private BigDecimal totalScore;

    private BigDecimal passingScore;

    private List<AttemptQuestionVO> questions;
}
