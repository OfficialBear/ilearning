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
public class QuestionBankListItemVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String title;

    private String description;

    private Integer sort;

    /**
     * 0=禁用 1=启用
     */
    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long totalQuestions;

    private Long enabledQuestions;

    private List<QuestionBankTypeCountVO> questionTypeCounts;
}
