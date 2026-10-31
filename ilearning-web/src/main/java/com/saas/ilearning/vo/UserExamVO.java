package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户可见的考试活动：只包含参加规则与本人的参加情况。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserExamVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String title;

    private String description;

    private String paperTitle;

    private BigDecimal totalScore;

    private BigDecimal passingScore;

    private Integer durationMinutes;

    private Integer maxAttempts;

    /**
     * 已产生的有效记录数（进行中、已交卷、已判分）。
     */
    private Integer attemptsUsed;

    /**
     * 当前进行中的记录 id；存在时前端应直接继续作答。
     */
    private Long inProgressAttemptId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Boolean canStart;

    private Boolean exhausted;
}
