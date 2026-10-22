package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.ExamStatusConstant;
import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.PaperStatusConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.ExamQueryDTO;
import com.saas.ilearning.dto.ExamSaveDTO;
import com.saas.ilearning.entity.Exam;
import com.saas.ilearning.entity.Paper;
import com.saas.ilearning.mapper.ExamMapper;
import com.saas.ilearning.mapper.PaperMapper;
import com.saas.ilearning.security.CurrentUserProvider;
import com.saas.ilearning.service.ExamService;
import com.saas.ilearning.vo.ExamVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class ExamServiceImpl implements ExamService {

    private final ExamMapper examMapper;
    private final PaperMapper paperMapper;

    public ExamServiceImpl(ExamMapper examMapper, PaperMapper paperMapper) {
        this.examMapper = examMapper;
        this.paperMapper = paperMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<ExamVO> page(ExamQueryDTO query) {
        if (query == null) {
            query = new ExamQueryDTO();
        }
        int page = query.getPage() == null || query.getPage() < 1 ? 1 : query.getPage();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1
                ? 10 : Math.min(query.getPageSize(), 100);
        query.setPage(page);
        query.setPageSize(pageSize);
        if (query.getStatus() != null && !ExamStatusConstant.isValid(query.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_STATUS_INVALID);
        }
        String keyword = query.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            query.setKeyword(keyword.isEmpty() ? null : keyword);
        }

        long total = examMapper.count(query);
        if (total == 0) {
            return new PageResult<>(0, List.of());
        }
        return new PageResult<>(total, examMapper.page(query));
    }

    @Override
    @Transactional(readOnly = true)
    public ExamVO detail(Long id) {
        ExamVO exam = examMapper.getVOById(id);
        if (exam == null) {
            throw new BaseException(MessageConstant.EXAM_NOT_FOUND);
        }
        return exam;
    }

    @Override
    @Transactional
    public Long create(ExamSaveDTO dto) {
        Paper paper = requirePublishedPaper(dto.getPaperId());
        validatePassingScore(dto.getPassingScore(), paper.getTotalScore());
        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        Exam exam = Exam.builder()
                .paperId(dto.getPaperId())
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .durationMinutes(dto.getDurationMinutes())
                .maxAttempts(dto.getMaxAttempts())
                .passingScore(dto.getPassingScore())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(ExamStatusConstant.DRAFT)
                .createdBy(CurrentUserProvider.requireCurrentUser().getUserId())
                .build();
        examMapper.insert(exam);
        log.info("创建考试成功：id={}, paperId={}", exam.getId(), exam.getPaperId());
        return exam.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ExamSaveDTO dto) {
        Exam existing = requireExam(id);
        if (!ExamStatusConstant.DRAFT.equals(existing.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_EDIT_FORBIDDEN);
        }
        // 已引用的试卷即使之后被归档，也允许继续保存草稿；切换试卷则必须选择已发布试卷。
        Paper paper = existing.getPaperId().equals(dto.getPaperId())
                ? requirePaper(dto.getPaperId())
                : requirePublishedPaper(dto.getPaperId());
        validatePassingScore(dto.getPassingScore(), paper.getTotalScore());
        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        Exam exam = Exam.builder()
                .id(id)
                .paperId(dto.getPaperId())
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .durationMinutes(dto.getDurationMinutes())
                .maxAttempts(dto.getMaxAttempts())
                .passingScore(dto.getPassingScore())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();
        if (examMapper.updateDraft(exam, ExamStatusConstant.DRAFT) == 0) {
            throw new BaseException(MessageConstant.EXAM_STATUS_TRANSITION_INVALID);
        }
        log.info("更新考试成功：id={}, paperId={}", id, exam.getPaperId());
    }

    @Override
    @Transactional
    public void publish(Long id) {
        Exam exam = requireExam(id);
        if (!ExamStatusConstant.DRAFT.equals(exam.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_STATUS_TRANSITION_INVALID);
        }
        // 发布是活动正式生效的时刻：试卷必须仍处于已发布状态，规则必须仍然成立。
        Paper paper = requirePublishedPaper(exam.getPaperId());
        validatePassingScore(exam.getPassingScore(), paper.getTotalScore());
        validateTimeRange(exam.getStartTime(), exam.getEndTime());

        if (examMapper.updateStatus(id, ExamStatusConstant.PUBLISHED, ExamStatusConstant.DRAFT) == 0) {
            throw new BaseException(MessageConstant.EXAM_STATUS_TRANSITION_INVALID);
        }
        log.info("发布考试成功：id={}, paperId={}", id, exam.getPaperId());
    }

    @Override
    @Transactional
    public void close(Long id) {
        Exam exam = requireExam(id);
        if (!ExamStatusConstant.PUBLISHED.equals(exam.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_STATUS_TRANSITION_INVALID);
        }
        if (examMapper.updateStatus(id, ExamStatusConstant.CLOSED, ExamStatusConstant.PUBLISHED) == 0) {
            throw new BaseException(MessageConstant.EXAM_STATUS_TRANSITION_INVALID);
        }
        log.info("关闭考试成功：id={}", id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Exam exam = requireExam(id);
        if (!ExamStatusConstant.DRAFT.equals(exam.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_DELETE_FORBIDDEN);
        }
        if (examMapper.countAttemptsByExamId(id) > 0) {
            throw new BaseException(MessageConstant.EXAM_IN_USE);
        }
        if (examMapper.deleteById(id, ExamStatusConstant.DRAFT) == 0) {
            throw new BaseException(MessageConstant.EXAM_DELETE_FORBIDDEN);
        }
        log.info("删除考试成功：id={}", id);
    }

    private Exam requireExam(Long id) {
        Exam exam = examMapper.getById(id);
        if (exam == null) {
            throw new BaseException(MessageConstant.EXAM_NOT_FOUND);
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

    private Paper requirePublishedPaper(Long paperId) {
        Paper paper = requirePaper(paperId);
        if (!PaperStatusConstant.PUBLISHED.equals(paper.getStatus())) {
            throw new BaseException(MessageConstant.EXAM_PAPER_NOT_AVAILABLE);
        }
        return paper;
    }

    private void validatePassingScore(BigDecimal passingScore, BigDecimal paperTotalScore) {
        if (passingScore.compareTo(paperTotalScore) > 0) {
            throw new BaseException(MessageConstant.EXAM_PASSING_SCORE_INVALID);
        }
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new BaseException(MessageConstant.EXAM_TIME_RANGE_INVALID);
        }
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
