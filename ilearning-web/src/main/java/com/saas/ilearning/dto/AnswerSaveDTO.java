package com.saas.ilearning.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 保存单题答案：选择题提交选项标识，简答题提交文本。
 */
@Data
public class AnswerSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "题目不能为空")
    private Long paperQuestionId;

    private List<String> optionKeys;

    @Size(max = 5000, message = "简答题答案最长 5000 位")
    private String textAnswer;
}
