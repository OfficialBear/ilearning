package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * {@code exam_answer.answer_content} 的 JSON 结构。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerContentVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<String> optionKeys;

    private String textAnswer;
}
