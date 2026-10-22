package com.saas.ilearning.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 试卷题目实体，对应 {@code paper_question} 表。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperQuestion implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long paperId;

    private Long questionId;

    /**
     * 题目在试卷中的展示顺序，从 1 开始。
     */
    private Integer sort;

    /**
     * 该题在当前试卷中的满分。
     */
    private BigDecimal score;

    /**
     * 发布时固化的题目内容快照（JSON 字符串）。
     * 数据库列为 NOT NULL，因此草稿保存时也会写入当前内容的快照。
     */
    private String questionSnapshot;
}
