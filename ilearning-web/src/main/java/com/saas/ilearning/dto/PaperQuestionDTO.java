package com.saas.ilearning.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class PaperQuestionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "题目不能为空")
    private Long questionId;

    @NotNull(message = "题目分值不能为空")
    @DecimalMin(value = "0.01", message = "题目分值必须大于 0")
    @DecimalMax(value = "1000.00", message = "单题分值不能超过 1000")
    @Digits(integer = 6, fraction = 2, message = "题目分值最多保留 2 位小数")
    private BigDecimal score;
}
