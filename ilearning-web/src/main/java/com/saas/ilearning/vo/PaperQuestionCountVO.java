package com.saas.ilearning.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 试卷题目数量聚合行，仅供服务层组装列表数据。
 */
@Data
public class PaperQuestionCountVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long paperId;

    private Long questionCount;
}
