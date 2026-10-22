package com.saas.ilearning.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ExamSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 引用一份已发布的试卷；发布考试时会再次校验试卷仍处于已发布状态。
     */
    @NotNull(message = "请选择试卷")
    private Long paperId;

    @NotBlank(message = "考试名称不能为空")
    @Size(max = 128, message = "考试名称最长 128 位")
    private String title;

    @Size(max = 1000, message = "考试说明最长 1000 位")
    private String description;

    /**
     * 0 表示不限时。
     */
    @NotNull(message = "考试时长不能为空")
    @Min(value = 0, message = "考试时长不能小于 0")
    @Max(value = 65535, message = "考试时长超出范围")
    private Integer durationMinutes;

    /**
     * 0 表示不限次数。
     */
    @NotNull(message = "考试次数不能为空")
    @Min(value = 0, message = "考试次数不能小于 0")
    @Max(value = 65535, message = "考试次数超出范围")
    private Integer maxAttempts;

    @NotNull(message = "及格分数不能为空")
    @DecimalMin(value = "0.00", message = "及格分数不能小于 0")
    @DecimalMax(value = "999999.99", message = "及格分数超出范围")
    @Digits(integer = 6, fraction = 2, message = "及格分数最多保留 2 位小数")
    private BigDecimal passingScore;

    /**
     * 为空表示不限制开始时间。
     */
    private LocalDateTime startTime;

    /**
     * 为空表示不限制结束时间。
     */
    private LocalDateTime endTime;
}
