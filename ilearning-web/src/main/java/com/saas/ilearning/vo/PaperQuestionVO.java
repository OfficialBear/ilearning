package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperQuestionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long paperQuestionId;

    private Long questionId;

    private Integer sort;

    private BigDecimal score;

    private Integer questionType;

    private Integer difficulty;

    private String content;

    private String imageUrl;

    private String analysis;

    private List<QuestionOptionVO> options;

    /**
     * true 表示内容来自发布时固化的快照。
     */
    private Boolean snapshot;
}
