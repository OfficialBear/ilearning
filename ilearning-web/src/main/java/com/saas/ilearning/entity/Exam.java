package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 考试活动实体，对应 {@code exam} 表。
 *
 * <p>考试只定义“怎么考”：引用试卷、开放时间、时长、次数与及格线；
 * 考生每次作答由 {@code exam_attempt} 记录。</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exam implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long paperId;

    private String title;

    private String description;

    /**
     * 单次考试时长（分钟），0 表示不限时。
     */
    private Integer durationMinutes;

    /**
     * 每位考生的最大参加次数，0 表示不限次数。
     */
    private Integer maxAttempts;

    /**
     * 本场考试的及格分数，不得超过所引用试卷的总分。
     */
    private BigDecimal passingScore;

    /**
     * 开放开始时间，null 表示不限制。
     */
    private LocalDateTime startTime;

    /**
     * 开放结束时间，null 表示不限制。
     */
    private LocalDateTime endTime;

    /**
     * 0=草稿 1=已发布 2=已关闭
     */
    private Integer status;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
