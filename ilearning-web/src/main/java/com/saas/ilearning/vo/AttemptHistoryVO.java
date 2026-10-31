package com.saas.ilearning.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistoryVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long examId;

    private String examTitle;

    private Integer attemptNo;

    /**
     * 1=进行中 2=已交卷 3=已判分 4=已取消
     */
    private Integer status;

    private BigDecimal userScore;

    private BigDecimal totalScore;

    private BigDecimal passingScore;

    private Boolean isPassed;

    private LocalDateTime startedAt;

    private LocalDateTime deadline;

    private LocalDateTime submittedAt;
}
