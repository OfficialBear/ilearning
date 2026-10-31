package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.AttemptStatusConstant;
import com.saas.ilearning.common.constant.ExamStatusConstant;
import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.QuestionTypeConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.dto.AnswerSaveDTO;
import com.saas.ilearning.entity.Exam;
import com.saas.ilearning.entity.ExamAnswer;
import com.saas.ilearning.entity.ExamAttempt;
import com.saas.ilearning.entity.Paper;
import com.saas.ilearning.entity.PaperQuestion;
import com.saas.ilearning.mapper.ExamAnswerMapper;
import com.saas.ilearning.mapper.ExamAttemptMapper;
import com.saas.ilearning.mapper.ExamMapper;
import com.saas.ilearning.mapper.PaperMapper;
import com.saas.ilearning.security.CurrentUserProvider;
import com.saas.ilearning.service.ExamAttemptService;
import com.saas.ilearning.vo.AnswerContentVO;
import com.saas.ilearning.vo.AttemptPaperVO;
import com.saas.ilearning.vo.AttemptQuestionVO;
import com.saas.ilearning.vo.AttemptResultOptionVO;
import com.saas.ilearning.vo.AttemptResultQuestionVO;
import com.saas.ilearning.vo.AttemptResultVO;
import com.saas.ilearning.vo.CandidateOptionVO;
import com.saas.ilearning.vo.PaperSnapshotVO;
import com.saas.ilearning.vo.QuestionOptionVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private static final int MAX_SAQ_LENGTH = 5000;

    private final ExamMapper examMapper;
    private final ExamAttemptMapper attemptMapper;
    private final ExamAnswerMapper answerMapper;
    private final PaperMapper paperMapper;
    private final ObjectMapper objectMapper;
    private final AttemptGradingService gradingService;

    public ExamAttemptServiceImpl(ExamMapper examMapper,
                                  ExamAttemptMapper attemptMapper,
                                  ExamAnswerMapper answerMapper,
                                  PaperMapper paperMapper,
                                  ObjectMapper objectMapper,
                                  AttemptGradingService gradingService) {
        this.examMapper = examMapper;
        this.attemptMapper = attemptMapper;
        this.answerMapper = answerMapper;
        this.paperMapper = paperMapper;
        this.objectMapper = objectMapper;
        this.gradingService = gradingService;
    }

    @Override
    @Transactional
    public AttemptPaperVO start(Long examId) {
        Long userId = currentUserId();

        // 必须先锁考试行，再进行本事务的首次普通读：否则 REPEATABLE READ 可能在锁之前建立快照，
        // 导致并发请求看不到对方刚提交的考试记录。
        Exam exam = examMapper.getByIdForUpdate(examId);
        if (exam == null || !ExamStatusConstant.PUBLISHED.equals(exam.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_NOT_AVAILABLE);
        }
        LocalDateTime now = LocalDateTime.now();
        ExamAttempt current = attemptMapper.findInProgress(userId, examId);
        if (current != null) {
            if (isExpired(current, now)) {
                gradingService.finalizeExpired(current.getId());
                throw new BaseException(MessageConstant.ATTEMPT_AUTO_SUBMITTED);
            }
            return buildPaper(current, exam);
        }

        assertExamOpen(exam, now);
        int used = attemptMapper.countEffectiveAttempts(userId, examId);
        if (exam.getMaxAttempts() != null && exam.getMaxAttempts() > 0 && used >= exam.getMaxAttempts()) {
            throw new BaseException(MessageConstant.EXAM_ATTEMPTS_EXHAUSTED);
        }

        Paper paper = paperMapper.getById(exam.getPaperId());
        if (paper == null) {
            throw new BaseException(MessageConstant.PAPER_NOT_FOUND);
        }

        int attemptNo = attemptMapper.maxAttemptNo(userId, examId) + 1;
        ExamAttempt attempt = ExamAttempt.builder()
                .examId(examId)
                .userId(userId)
                .attemptNo(attemptNo)
                .status(AttemptStatusConstant.IN_PROGRESS)
                .totalScore(paper.getTotalScore())
                .passingScore(exam.getPassingScore())
                .startedAt(now)
                .deadline(computeDeadline(exam, now))
                .build();
        attemptMapper.insert(attempt);
        log.info("开始考试：attemptId={}, examId={}, userId={}, attemptNo={}",
                attempt.getId(), examId, userId, attemptNo);
        return buildPaper(attempt, exam);
    }

    @Override
    public AttemptPaperVO paper(Long attemptId) {
        Long userId = currentUserId();
        ExamAttempt attempt = requireOwnedAttempt(attemptId, userId);
        if (!AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_IN_PROGRESS);
        }
        if (isExpired(attempt, LocalDateTime.now())) {
            gradingService.finalizeExpired(attemptId);
            throw new BaseException(MessageConstant.ATTEMPT_EXPIRED);
        }
        return buildPaper(attempt);
    }

    @Override
    @Transactional
    public void saveAnswer(Long attemptId, AnswerSaveDTO dto) {
        Long userId = currentUserId();
        ExamAttempt attempt = requireOwnedAttempt(attemptId, userId);
        if (!AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_IN_PROGRESS);
        }
        if (isExpired(attempt, LocalDateTime.now())) {
            gradingService.finalizeExpired(attemptId);
            throw new BaseException(MessageConstant.ATTEMPT_EXPIRED);
        }

        // 锁定记录后再校验一次，避免交卷与保存并发时写入已结束的考试。
        attempt = attemptMapper.getByIdForUpdate(attemptId);
        requireOwned(attempt, userId);
        if (!AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_IN_PROGRESS);
        }
        if (isExpired(attempt, LocalDateTime.now())) {
            throw new BaseException(MessageConstant.ATTEMPT_EXPIRED);
        }

        Exam exam = requireExam(attempt.getExamId());
        PaperQuestion paperQuestion = findPaperQuestion(exam.getPaperId(), dto.getPaperQuestionId());
        PaperSnapshotVO snapshot = parseSnapshot(paperQuestion.getQuestionSnapshot());
        if (snapshot == null) {
            throw new BaseException(MessageConstant.PAPER_CONTENT_INVALID);
        }
        AnswerContentVO content = buildAnswerContent(dto, snapshot);
        if (content == null) {
            answerMapper.deleteAnswer(attemptId, paperQuestion.getId());
            return;
        }
        ExamAnswer answer = ExamAnswer.builder()
                .examAttemptId(attemptId)
                .paperQuestionId(paperQuestion.getId())
                .answerContent(serializeContent(content))
                .score(paperQuestion.getScore())
                .answeredAt(LocalDateTime.now())
                .build();
        answerMapper.upsert(answer);
    }

    @Override
    public AttemptResultVO submit(Long attemptId) {
        Long userId = currentUserId();
        gradingService.submit(attemptId, userId, LocalDateTime.now());
        return buildResult(requireOwnedAttempt(attemptId, userId));
    }

    @Override
    public AttemptResultVO result(Long attemptId) {
        Long userId = currentUserId();
        ExamAttempt attempt = requireOwnedAttempt(attemptId, userId);
        if (AttemptStatusConstant.IN_PROGRESS.equals(attempt.getStatus())) {
            if (!isExpired(attempt, LocalDateTime.now())) {
                throw new BaseException(MessageConstant.ATTEMPT_NOT_SUBMITTED);
            }
            gradingService.finalizeExpired(attemptId);
            attempt = requireOwnedAttempt(attemptId, userId);
        }
        return buildResult(attempt);
    }

    @Override
    public void finalizeExpiredAttempts(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        for (ExamAttempt attempt : attemptMapper.listExpiredInProgress(userId, now)) {
            gradingService.finalizeExpired(attempt.getId());
        }
    }

    private AttemptPaperVO buildPaper(ExamAttempt attempt) {
        return buildPaper(attempt, requireExam(attempt.getExamId()));
    }

    private AttemptPaperVO buildPaper(ExamAttempt attempt, Exam exam) {
        Paper paper = requirePaper(exam.getPaperId());
        List<PaperQuestion> questions = paperMapper.listQuestionsByPaperId(paper.getId());
        Map<Long, ExamAnswer> answers = answersByQuestion(attempt.getId());
        List<AttemptQuestionVO> items = new ArrayList<>(questions.size());
        for (PaperQuestion question : questions) {
            PaperSnapshotVO snapshot = parseSnapshot(question.getQuestionSnapshot());
            if (snapshot == null) {
                throw new BaseException(MessageConstant.PAPER_CONTENT_INVALID);
            }
            ExamAnswer answer = answers.get(question.getId());
            AnswerContentVO content = answer == null ? null : parseContent(answer.getAnswerContent());
            items.add(AttemptQuestionVO.builder()
                    .paperQuestionId(question.getId())
                    .sort(question.getSort())
                    .score(question.getScore())
                    .questionType(snapshot.getQuestionType())
                    .difficulty(snapshot.getDifficulty())
                    .content(snapshot.getContent())
                    .imageUrl(snapshot.getImageUrl())
                    .options(toCandidateOptions(snapshot.getOptions()))
                    .selectedOptionKeys(content == null || content.getOptionKeys() == null
                            ? List.of() : content.getOptionKeys())
                    .textAnswer(content == null ? null : content.getTextAnswer())
                    .build());
        }
        return AttemptPaperVO.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .examDescription(exam.getDescription())
                .attemptNo(attempt.getAttemptNo())
                .startedAt(attempt.getStartedAt())
                .deadline(attempt.getDeadline())
                .deadlineMillis(toMillis(attempt.getDeadline()))
                .serverTimeMillis(System.currentTimeMillis())
                .durationMinutes(exam.getDurationMinutes())
                .totalScore(attempt.getTotalScore())
                .passingScore(attempt.getPassingScore())
                .questions(items)
                .build();
    }

    private AttemptResultVO buildResult(ExamAttempt attempt) {
        Exam exam = requireExam(attempt.getExamId());
        Paper paper = requirePaper(exam.getPaperId());
        List<PaperQuestion> questions = paperMapper.listQuestionsByPaperId(paper.getId());
        Map<Long, ExamAnswer> answers = answersByQuestion(attempt.getId());
        List<AttemptResultQuestionVO> items = new ArrayList<>(questions.size());
        for (PaperQuestion question : questions) {
            PaperSnapshotVO snapshot = parseSnapshot(question.getQuestionSnapshot());
            if (snapshot == null) {
                log.warn("成绩单跳过无法解析的快照：paperQuestionId={}", question.getId());
                continue;
            }
            ExamAnswer answer = answers.get(question.getId());
            AnswerContentVO content = answer == null ? null : parseContent(answer.getAnswerContent());
            boolean subjective = QuestionTypeConstant.SAQ == intValue(snapshot.getQuestionType());
            String textAnswer = content == null ? null : trimToNull(content.getTextAnswer());
            Boolean isCorrect;
            BigDecimal actualScore;
            if (subjective) {
                if (textAnswer == null) {
                    isCorrect = Boolean.FALSE;
                    actualScore = BigDecimal.ZERO;
                } else {
                    isCorrect = answer == null ? null : answer.getIsCorrect();
                    actualScore = answer == null ? null : answer.getActualScore();
                }
            } else if (answer == null) {
                isCorrect = Boolean.FALSE;
                actualScore = BigDecimal.ZERO;
            } else {
                isCorrect = Boolean.TRUE.equals(answer.getIsCorrect());
                actualScore = answer.getActualScore() == null ? BigDecimal.ZERO : answer.getActualScore();
            }
            items.add(AttemptResultQuestionVO.builder()
                    .paperQuestionId(question.getId())
                    .sort(question.getSort())
                    .score(question.getScore())
                    .questionType(snapshot.getQuestionType())
                    .difficulty(snapshot.getDifficulty())
                    .content(snapshot.getContent())
                    .imageUrl(snapshot.getImageUrl())
                    .options(toResultOptions(snapshot.getOptions()))
                    .selectedOptionKeys(content == null || content.getOptionKeys() == null
                            ? List.of() : content.getOptionKeys())
                    .textAnswer(textAnswer)
                    .isCorrect(isCorrect)
                    .actualScore(actualScore)
                    .analysis(snapshot.getAnalysis())
                    .build());
        }
        return AttemptResultVO.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .attemptNo(attempt.getAttemptNo())
                .status(attempt.getStatus())
                .userScore(attempt.getUserScore())
                .totalScore(attempt.getTotalScore())
                .passingScore(attempt.getPassingScore())
                .isPassed(attempt.getIsPassed())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .pendingManualGrading(AttemptStatusConstant.SUBMITTED.equals(attempt.getStatus()))
                .questions(items)
                .build();
    }

    private AnswerContentVO buildAnswerContent(AnswerSaveDTO dto, PaperSnapshotVO snapshot) {
        int type = intValue(snapshot.getQuestionType());
        List<String> keys = normalizeOptionKeys(dto.getOptionKeys());
        String text = trimToNull(dto.getTextAnswer());
        if (type == QuestionTypeConstant.SAQ) {
            if (!keys.isEmpty()) {
                throw new BaseException(MessageConstant.ANSWER_OPTION_INVALID);
            }
            if (text == null) {
                return null;
            }
            if (text.length() > MAX_SAQ_LENGTH) {
                throw new BaseException(MessageConstant.ANSWER_TEXT_INVALID);
            }
            return new AnswerContentVO(List.of(), text);
        }
        if (text != null) {
            throw new BaseException(MessageConstant.ANSWER_TEXT_INVALID);
        }
        if (keys.isEmpty()) {
            return null;
        }
        Set<String> allowedKeys = new HashSet<>();
        if (snapshot.getOptions() != null) {
            for (QuestionOptionVO option : snapshot.getOptions()) {
                if (option.getOptionKey() != null) {
                    allowedKeys.add(option.getOptionKey());
                }
            }
        }
        if (!allowedKeys.containsAll(keys)) {
            throw new BaseException(MessageConstant.ANSWER_OPTION_INVALID);
        }
        if ((type == QuestionTypeConstant.SINGLE || type == QuestionTypeConstant.JUDGE)
                && keys.size() != 1) {
            throw new BaseException(MessageConstant.ANSWER_OPTION_INVALID);
        }
        return new AnswerContentVO(keys, null);
    }

    private Exam requireExam(Long examId) {
        Exam exam = examMapper.getById(examId);
        if (exam == null) {
            throw new BaseException(MessageConstant.EXAM_NOT_AVAILABLE);
        }
        return exam;
    }

    private Paper requirePaper(Long paperId) {
        Paper paper = paperMapper.getById(paperId);
        if (paper == null) {
            throw new BaseException(MessageConstant.PAPER_NOT_FOUND);
        }
        return paper;
    }

    private PaperQuestion findPaperQuestion(Long paperId, Long paperQuestionId) {
        for (PaperQuestion question : paperMapper.listQuestionsByPaperId(paperId)) {
            if (question.getId().equals(paperQuestionId)) {
                return question;
            }
        }
        throw new BaseException(MessageConstant.ANSWER_QUESTION_INVALID);
    }

    private Map<Long, ExamAnswer> answersByQuestion(Long attemptId) {
        Map<Long, ExamAnswer> answers = new HashMap<>();
        for (ExamAnswer answer : answerMapper.listByAttemptId(attemptId)) {
            answers.put(answer.getPaperQuestionId(), answer);
        }
        return answers;
    }

    private List<CandidateOptionVO> toCandidateOptions(List<QuestionOptionVO> options) {
        if (options == null || options.isEmpty()) {
            return List.of();
        }
        return options.stream()
                .map(option -> CandidateOptionVO.builder()
                        .optionKey(option.getOptionKey())
                        .content(option.getContent())
                        .imageUrl(option.getImageUrl())
                        .build())
                .toList();
    }

    private List<AttemptResultOptionVO> toResultOptions(List<QuestionOptionVO> options) {
        if (options == null || options.isEmpty()) {
            return List.of();
        }
        return options.stream()
                .map(option -> AttemptResultOptionVO.builder()
                        .optionKey(option.getOptionKey())
                        .content(option.getContent())
                        .imageUrl(option.getImageUrl())
                        .isCorrect(option.getIsCorrect())
                        .build())
                .toList();
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

    private String serializeContent(AnswerContentVO content) {
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JacksonException e) {
            log.error("序列化答案失败", e);
            throw new BaseException(MessageConstant.ANSWER_SAVE_FAILED, e);
        }
    }

    private void assertExamOpen(Exam exam, LocalDateTime now) {
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BaseException(MessageConstant.EXAM_NOT_OPEN);
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BaseException(MessageConstant.EXAM_ENDED);
        }
    }

    private LocalDateTime computeDeadline(Exam exam, LocalDateTime now) {
        LocalDateTime deadline = exam.getDurationMinutes() != null && exam.getDurationMinutes() > 0
                ? now.plusMinutes(exam.getDurationMinutes()) : null;
        if (exam.getEndTime() != null && (deadline == null || deadline.isAfter(exam.getEndTime()))) {
            deadline = exam.getEndTime();
        }
        return deadline;
    }

    private boolean isExpired(ExamAttempt attempt, LocalDateTime now) {
        return attempt.getDeadline() != null && !now.isBefore(attempt.getDeadline());
    }

    private Long toMillis(LocalDateTime value) {
        return value == null ? null
                : value.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    private ExamAttempt requireOwnedAttempt(Long attemptId, Long userId) {
        ExamAttempt attempt = attemptMapper.getById(attemptId);
        requireOwned(attempt, userId);
        return attempt;
    }

    private void requireOwned(ExamAttempt attempt, Long userId) {
        if (attempt == null || !Objects.equals(attempt.getUserId(), userId)) {
            throw new BaseException(MessageConstant.ATTEMPT_NOT_FOUND);
        }
    }

    private static List<String> normalizeOptionKeys(List<String> raw) {
        if (raw == null) {
            return List.of();
        }
        return raw.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(key -> !key.isEmpty())
                .distinct()
                .sorted()
                .toList();
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

    private static Long currentUserId() {
        return CurrentUserProvider.requireCurrentUser().getUserId();
    }
}
