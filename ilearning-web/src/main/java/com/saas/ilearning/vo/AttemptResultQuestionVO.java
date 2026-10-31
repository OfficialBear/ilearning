package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 成绩单中的单题结果。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultQuestionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long paperQuestionId;

    private Integer sort;

    private BigDecimal score;

    private Integer questionType;

    private Integer difficulty;

    private String content;

    private String imageUrl;

    private List<AttemptResultOptionVO> options;

    private List<String> selectedOptionKeys;

    private String textAnswer;

    /**
     * 客观题是否正确；简答题待人工评分时为 null。
     */
    private Boolean isCorrect;

    /**
     * 实际得分；简答题待人工评分时为 null。
     */
    private BigDecimal actualScore;

    private String analysis;
}
