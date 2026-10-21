package com.saas.ilearning.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

@Data
public class QuestionOptionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "选项内容不能为空")
    @Size(max = 5000, message = "选项内容最长 5000 位")
    private String content;

    @Size(max = 512, message = "选项图片地址最长 512 位")
    private String imageUrl;

    @NotNull(message = "是否正确不能为空")
    @Min(value = 0, message = "是否正确只能为 0 或 1")
    @Max(value = 1, message = "是否正确只能为 0 或 1")
    private Integer isCorrect;
}
