package com.saas.ilearning.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PaperSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "试卷名称不能为空")
    @Size(max = 128, message = "试卷名称最长 128 位")
    private String title;

    @Size(max = 1000, message = "试卷描述最长 1000 位")
    private String description;

    /**
     * 按题目在试卷中的展示顺序传入；题序由服务端按列表下标生成。
     */
    @Valid
    @Size(max = 200, message = "单份试卷最多 200 道题")
    private List<PaperQuestionDTO> questions;
}
