package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 发布快照的 JSON 结构，版本号用于后续兼容升级。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSnapshotVO implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final int CURRENT_VERSION = 1;

    private Integer version;

    private Integer questionType;

    private Integer difficulty;

    private String content;

    private String imageUrl;

    private String analysis;

    private List<QuestionOptionVO> options;
}
