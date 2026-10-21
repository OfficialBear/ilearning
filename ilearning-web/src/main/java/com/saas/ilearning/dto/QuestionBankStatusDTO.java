package com.saas.ilearning.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class QuestionBankStatusDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "题库状态不能为空")
    @Min(value = 0, message = "题库状态不合法")
    @Max(value = 1, message = "题库状态不合法")
    private Integer status;
}
