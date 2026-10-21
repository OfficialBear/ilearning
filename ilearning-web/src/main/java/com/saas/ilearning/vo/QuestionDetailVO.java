package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDetailVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long questionBankId;

    private Integer questionType;

    private Integer difficulty;

    private String content;

    private String imageUrl;

    private String analysis;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long paperReferenceCount;

    private QuestionBankBriefVO questionBank;

    private List<QuestionOptionVO> options;
}
