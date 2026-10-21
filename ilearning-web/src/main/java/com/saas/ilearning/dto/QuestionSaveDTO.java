package com.saas.ilearning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class QuestionSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "题目类型不能为空")
    @Min(value = 1, message = "题目类型不合法")
    @Max(value = 4, message = "题目类型不合法")
    private Integer questionType;

    @NotNull(message = "题目难度不能为空")
    @Min(value = 1, message = "题目难度不合法")
    @Max(value = 3, message = "题目难度不合法")
    private Integer difficulty;

    @Size(max = 512, message = "题目图片地址最长 512 位")
    private String imageUrl;

    @NotBlank(message = "题干不能为空")
    @Size(max = 2000, message = "题干最长 2000 位")
    private String content;

    @Size(max = 2000, message = "试题解析最长 2000 位")
    private String analysis;

    @NotNull(message = "所属题库不能为空")
    private Long questionBankId;

    @Valid
    private List<QuestionOptionDTO> options;
}
