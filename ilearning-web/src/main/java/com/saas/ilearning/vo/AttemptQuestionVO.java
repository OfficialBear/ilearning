package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 作答中的题目：不包含正确答案、解析与判题结果。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptQuestionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long paperQuestionId;

    private Integer sort;

    private BigDecimal score;

    private Integer questionType;

    private Integer difficulty;

    private String content;

    private String imageUrl;

    private List<CandidateOptionVO> options;

    private List<String> selectedOptionKeys;

    private String textAnswer;
}
