package com.saas.ilearning.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

@Data
public class QuestionBankSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "题库名称不能为空")
    @Size(max = 128, message = "题库名称最长 128 位")
    private String title;

    @Size(max = 500, message = "题库描述最长 500 位")
    private String description;

    @Min(value = 0, message = "排序值不能小于 0")
    @Max(value = 9999, message = "排序值不能超过 9999")
    private Integer sort;

    @Min(value = 0, message = "题库状态不合法")
    @Max(value = 1, message = "题库状态不合法")
    private Integer status;
}
