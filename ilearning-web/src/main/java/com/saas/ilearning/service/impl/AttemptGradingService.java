package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.AttemptStatusConstant;
import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.QuestionTypeConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.entity.Exam;
import com.saas.ilearning.entity.ExamAnswer;
import com.saas.ilearning.entity.ExamAttempt;
import com.saas.ilearning.entity.Paper;
import com.saas.ilearning.entity.PaperQuestion;
import com.saas.ilearning.mapper.ExamAnswerMapper;
import com.saas.ilearning.mapper.ExamAttemptMapper;
import com.saas.ilearning.mapper.ExamMapper;
import com.saas.ilearning.mapper.PaperMapper;
import com.saas.ilearning.vo.AnswerContentVO;
import com.saas.ilearning.vo.PaperSnapshotVO;
import com.saas.ilearning.vo.QuestionOptionVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 在独立事务中完成交卷与判分，确保“自动交卷后抛错提示”不会随外层事务回滚。
 */
@Service
@Slf4j
public class AttemptGradingService {

    private final ExamMapper examMapper;
    private final ExamAttemptMapper attemptMapper;
    private final ExamAnswerMapper answerMapper;
    private final PaperMapper paperMapper;
    private final ObjectMapper objectMapper;

    public AttemptGradingService(ExamMapper examMapper,
                                 ExamAttemptMapper attemptMapper,
                                 ExamAnswerMapper answerMapper,
                                 PaperMapper paperMapper,
                                 ObjectMapper objectMapper) {
        this.examMapper = examMapper;
        this.attemptMapper = attemptMapper;
        this.answerMapper = answerMapper;
        this.paperMapper = paperMapper;
        this.objectMapper = objectMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finalizeExpired(Long attemptId) {
        ExamAttempt attempt = attemptMapper.getByIdForUpdate(attemptId);
        if (attempt == null || !AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        if (attempt.getDeadline() == null || attempt.getDeadline().isAfter(now)) {
            return;
        }
        gradeAndFinalize(attempt, attempt.getDeadline());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void submit(Long attemptId, Long userId, LocalDateTime submittedAt) {
        ExamAttempt attempt = attemptMapper.getByIdForUpdate(attemptId);
        if (attempt == null || !Objects.equals(attempt.getUserId(), userId)) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_FOUND);
        }
        if (AttemptStatusConstant.CANCELLED.equals(attempt.getStatus())) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_IN_PROGRESS);
        }
        if (!AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            return;
        }
        gradeAndFinalize(attempt, submittedAt);
    }

    private void gradeAndFinalize(ExamAttempt attempt, LocalDateTime submittedAt) {
        Exam exam = examMapper.getById(attempt.getExamId());
        if (exam == null) {
            throw new BaseException(MessageConstant.EXAM_NOT_AVAILABLE);
        }
        Paper paper = paperMapper.getById(exam.getPaperId());
        if (paper == null) {
            throw new BaseException(MessageConstant.PAPER_NOT_FOUND);
        }
        List<PaperQuestion> questions = paperMapper.listQuestionsByPaperId(paper.getId());
        Map<Long, ExamAnswer> answers = answersByQuestion(attempt.getId());

        BigDecimal userScore = BigDecimal.ZERO;
        boolean pendingManualGrading = false;
        for (PaperQuestion question : questions) {
            PaperSnapshotVO snapshot = parseSnapshot(question.getQuestionSnapshot());
            if (snapshot == null) {
                log.warn("交卷时跳过无法解析的快照：paperQuestionId={}", question.getId());
                continue;
            }
            ExamAnswer answer = answers.get(question.getId());
            AnswerContentVO content = answer == null ? null : parseContent(answer.getAnswerContent());
            if (QuestionTypeConstant.SAQ == intValue(snapshot.getQuestionType())) {
                String text = content == null ? null : trimToNull(content.getTextAnswer());
                if (text == null) {
                    if (answer != null) {
                        answerMapper.updateGrade(answer.getId(), Boolean.FALSE, BigDecimal.ZERO);
                    }
                } else {
                    pendingManualGrading = true;
                    answerMapper.updateGrade(answer.getId(), null, null);
                }
                continue;
            }
            boolean correct = content != null && isCorrectObjective(snapshot, content);
            BigDecimal actualScore = correct ? question.getScore() : BigDecimal.ZERO;
            if (answer != null) {
                answerMapper.updateGrade(answer.getId(), correct, actualScore);
            }
            userScore = userScore.add(actualScore);
        }

        Integer status = pendingManualGrading
                ? AttemptStatusConstant.SUBMITTED : AttemptStatusConstant.GRADED;
        Boolean passed = pendingManualGrading
                ? null : userScore.compareTo(attempt.getPassingScore()) >= 0;
        LocalDateTime effectiveSubmittedAt = clampSubmittedAt(attempt, submittedAt);
        LocalDateTime gradedAt = pendingManualGrading ? null : effectiveSubmittedAt;
        int updated = attemptMapper.finalizeAttempt(
                attempt.getId(),
                status,
                userScore,
                passed,
                effectiveSubmittedAt,
                gradedAt,
                elapsedSeconds(attempt.getStartedAt(), effectiveSubmittedAt),
                AttemptStatusConstant.IN_PROGRESS);
        if (updated == 0) {
            log.warn("考试记录已被其他请求交卷：attemptId={}", attempt.getId());
        } else {
            log.info("交卷完成：attemptId={}, status={}, userScore={}",
                    attempt.getId(), status, userScore);
        }
    }

    private boolean isCorrectObjective(PaperSnapshotVO snapshot, AnswerContentVO content) {
        List<String> selected = content.getOptionKeys() == null ? List.of() : content.getOptionKeys();
        if (selected.isEmpty()) {
            return false;
        }
        Set<String> correctKeys = new HashSet<>();
        if (snapshot.getOptions() != null) {
            for (QuestionOptionVO option : snapshot.getOptions()) {
                if (Integer.valueOf(1).equals(option.getIsCorrect()) && option.getOptionKey() != null) {
                    correctKeys.add(option.getOptionKey());
                }
            }
        }
        return new HashSet<>(selected).equals(correctKeys);
    }

    private Map<Long, ExamAnswer> answersByQuestion(Long attemptId) {
        Map<Long, ExamAnswer> answers = new HashMap<>();
        for (ExamAnswer answer : answerMapper.listByAttemptId(attemptId)) {
            answers.put(answer.getPaperQuestionId(), answer);
        }
        return answers;
    }

    private PaperSnapshotVO parseSnapshot(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, PaperSnapshotVO.class);
        } catch (JacksonException e) {
            log.warn("解析试卷快照失败：{}", e.getMessage());
            return null;
        }
    }

    private AnswerContentVO parseContent(String json) {
        if (json == null || json.isBlank()) {
            return new AnswerContentVO();
        }
        try {
            AnswerContentVO content = objectMapper.readValue(json, AnswerContentVO.class);
            return content == null ? new AnswerContentVO() : content;
        } catch (JacksonException e) {
            log.warn("解析答案内容失败：{}", e.getMessage());
            return new AnswerContentVO();
        }
    }

    private LocalDateTime clampSubmittedAt(ExamAttempt attempt, LocalDateTime submittedAt) {
        LocalDateTime result = submittedAt == null ? LocalDateTime.now() : submittedAt;
        if (attempt.getDeadline() != null && result.isAfter(attempt.getDeadline())) {
            result = attempt.getDeadline();
        }
        if (attempt.getStartedAt() != null && result.isBefore(attempt.getStartedAt())) {
            result = attempt.getStartedAt();
        }
        return result;
    }

    private int elapsedSeconds(LocalDateTime startedAt, LocalDateTime submittedAt) {
        if (startedAt == null || submittedAt == null) {
            return 0;
        }
        long seconds = Duration.between(startedAt, submittedAt).getSeconds();
        if (seconds < 0) {
            seconds = 0;
        }
        return (int) Math.min(Integer.MAX_VALUE, seconds);
    }

    private static int intValue(Integer value) {
        return value == null ? 0 : value;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
