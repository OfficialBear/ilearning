package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 成绩单中的选项，交卷后允许展示是否正确。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultOptionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String optionKey;

    private String content;

    private String imageUrl;

    private Integer isCorrect;
}
