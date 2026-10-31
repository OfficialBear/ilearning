package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 用户作答时可见的选项，刻意不包含 isCorrect。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateOptionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String optionKey;

    private String content;

    private String imageUrl;
}
