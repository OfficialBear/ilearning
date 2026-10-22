package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 考试活动展示对象：列表与详情使用同一份契约（考试自身不包含题目明细）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long paperId;

    private String paperTitle;

    private BigDecimal paperTotalScore;

    /**
     * 0=草稿 1=已发布 2=已归档，用于提示试卷是否仍可用于发布。
     */
    private Integer paperStatus;

    private String title;

    private String description;

    private Integer durationMinutes;

    private Integer maxAttempts;

    private BigDecimal passingScore;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    /**
     * 0=草稿 1=已发布 2=已关闭
     */
    private Integer status;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
