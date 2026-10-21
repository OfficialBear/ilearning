package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String optionKey;

    private String content;

    private String imageUrl;

    private Integer isCorrect;
}
