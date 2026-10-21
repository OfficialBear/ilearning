package com.saas.ilearning.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 题库题目统计的聚合行，仅供服务层组装列表数据，不直接返回给前端。
 */
@Data
public class QuestionBankQuestionStatVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long bankId;

    private Integer questionType;

    private Long total;

    private Long enabled;
}
