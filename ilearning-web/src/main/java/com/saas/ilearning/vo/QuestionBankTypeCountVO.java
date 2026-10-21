package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 题库内某题型的题目数量。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankTypeCountVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer questionType;

    private Long total;
}
