package com.saas.ilearning.service;

import com.saas.ilearning.dto.AnswerSaveDTO;
import com.saas.ilearning.vo.AttemptPaperVO;
import com.saas.ilearning.vo.AttemptResultVO;

public interface ExamAttemptService {

    /**
     * 开始或继续一次考试：存在未过期的进行中记录时直接返回该记录。
     */
    AttemptPaperVO start(Long examId);

    /**
     * 读取进行中考试的作答页面（含已保存答案）。
     */
    AttemptPaperVO paper(Long attemptId);

    void saveAnswer(Long attemptId, AnswerSaveDTO dto);

    /**
     * 交卷并判分；重复调用返回同一份成绩。
     */
    AttemptResultVO submit(Long attemptId);

    AttemptResultVO result(Long attemptId);

    /**
     * 将当前用户所有已到截止时间的进行中记录自动交卷。
     */
    void finalizeExpiredAttempts(Long userId);
}
