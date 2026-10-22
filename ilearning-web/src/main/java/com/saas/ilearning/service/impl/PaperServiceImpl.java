package com.saas.ilearning.service.impl;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.PaperStatusConstant;
import com.saas.ilearning.common.constant.StatusConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.PaperQueryDTO;
import com.saas.ilearning.dto.PaperQuestionDTO;
import com.saas.ilearning.dto.PaperSaveDTO;
import com.saas.ilearning.entity.Paper;
import com.saas.ilearning.entity.PaperQuestion;
import com.saas.ilearning.entity.Question;
import com.saas.ilearning.entity.QuestionOption;
import com.saas.ilearning.mapper.PaperMapper;
import com.saas.ilearning.mapper.QuestionMapper;
import com.saas.ilearning.security.CurrentUserProvider;
import com.saas.ilearning.service.PaperService;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.vo.PaperDetailVO;
import com.saas.ilearning.vo.PaperListItemVO;
import com.saas.ilearning.vo.PaperQuestionCountVO;
import com.saas.ilearning.vo.PaperQuestionVO;
import com.saas.ilearning.vo.PaperSnapshotVO;
import com.saas.ilearning.vo.QuestionOptionVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
public class PaperServiceImpl implements PaperService {

    private final PaperMapper paperMapper;
    private final QuestionMapper questionMapper;
    private final QuestionBankService questionBankService;
    private final ObjectMapper objectMapper;

    public PaperServiceImpl(PaperMapper paperMapper,
                            QuestionMapper questionMapper,
                            QuestionBankService questionBankService,
                            ObjectMapper objectMapper) {
        this.paperMapper = paperMapper;
        this.questionMapper = questionMapper;
        this.questionBankService = questionBankService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<PaperListItemVO> page(PaperQueryDTO query) {
        if (query == null) {
            query = new PaperQueryDTO();
        }
        int page = query.getPage() == null || query.getPage() < 1 ? 1 : query.getPage();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1
                ? 10 : Math.min(query.getPageSize(), 100);
        query.setPage(page);
        query.setPageSize(pageSize);
        if (query.getStatus() != null && !PaperStatusConstant.isValid(query.getStatus())) {
            throw new BaseException(MessageConstant.PAPER_STATUS_INVALID);
        }
        String keyword = query.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            query.setKeyword(keyword.isEmpty() ? null : keyword);
        }

        long total = paperMapper.count(query);
        if (total == 0) {
            return new PageResult<>(0, List.of());
        }
        List<PaperListItemVO> records = paperMapper.page(query);
        fillQuestionCounts(records);
        return new PageResult<>(total, records);
    }

    @Override
    @Transactional(readOnly = true)
    public PaperDetailVO detail(Long id) {
        Paper paper = requirePaper(id);
        List<PaperQuestion> links = paperMapper.listQuestionsByPaperId(id);
        List<PaperQuestionVO> questions = buildDetailQuestions(paper, links);
        return PaperDetailVO.builder()
                .id(paper.getId())
                .title(paper.getTitle())
                .description(paper.getDescription())
                .totalScore(paper.getTotalScore())
                .status(paper.getStatus())
                .createdBy(paper.getCreatedBy())
                .createdAt(paper.getCreatedAt())
                .updatedAt(paper.getUpdatedAt())
                .questions(questions)
                .build();
    }

    @Override
    @Transactional
    public Long create(PaperSaveDTO dto) {
        List<PaperQuestion> links = buildLinks(dto.getQuestions(), Set.of());
        Long userId = CurrentUserProvider.requireCurrentUser().getUserId();
        Paper paper = Paper.builder()
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .totalScore(sumScore(links))
                .status(PaperStatusConstant.DRAFT)
                .createdBy(userId)
                .build();
        paperMapper.insert(paper);
        insertLinks(paper.getId(), links);
        log.info("创建试卷成功：id={}, questionCount={}", paper.getId(), links.size());
        return paper.getId();
    }

    @Override
    @Transactional
    public void update(Long id, PaperSaveDTO dto) {
        Paper existing = requirePaper(id);
        if (!PaperStatusConstant.DRAFT.equals(existing.getStatus())) {
            throw new BaseException(MessageConstant.PAPER_EDIT_FORBIDDEN);
        }
        // 已在试卷中的题目即使所在题库之后被停用，也允许保留，避免草稿无法再保存。
        Set<Long> existingQuestionIds = new HashSet<>();
        for (PaperQuestion link : paperMapper.listQuestionsByPaperId(id)) {
            existingQuestionIds.add(link.getQuestionId());
        }

        List<PaperQuestion> links = buildLinks(dto.getQuestions(), existingQuestionIds);
        paperMapper.update(Paper.builder()
                .id(id)
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .totalScore(sumScore(links))
                .build());
        paperMapper.deleteQuestionsByPaperId(id);
        insertLinks(id, links);
        log.info("更新试卷成功：id={}, questionCount={}", id, links.size());
    }

    @Override
    @Transactional
    public void publish(Long id) {
        Paper paper = requirePaper(id);
        if (!PaperStatusConstant.DRAFT.equals(paper.getStatus())) {
            throw new BaseException(MessageConstant.PAPER_STATUS_TRANSITION_INVALID);
        }
        List<PaperQuestion> links = paperMapper.listQuestionsByPaperId(id);
        if (links.isEmpty()) {
            throw new BaseException(MessageConstant.PAPER_QUESTIONS_REQUIRED);
        }

        Map<Long, Question> questions = loadQuestions(links);
        Map<Long, List<QuestionOption>> options = loadOptions(links);
        BigDecimal totalScore = BigDecimal.ZERO;
        for (PaperQuestion link : links) {
            Question question = questions.get(link.getQuestionId());
            if (question == null) {
                throw new BaseException(MessageConstant.PAPER_QUESTION_NOT_FOUND);
            }
            // 发布是试卷正式生效的时刻，此时必须保证题目本身与所属题库都可用。
            if (!StatusConstant.ENABLED.equals(question.getStatus())) {
                throw new BaseException(MessageConstant.PAPER_QUESTION_DISABLED);
            }
            questionBankService.ensureAvailable(question.getQuestionBankId());
            paperMapper.updateQuestionSnapshot(id, question.getId(),
                    serializeSnapshot(question, options.get(question.getId())));
            totalScore = totalScore.add(link.getScore());
        }
        paperMapper.update(Paper.builder()
                .id(id)
                .title(paper.getTitle())
                .description(paper.getDescription())
                .totalScore(totalScore)
                .build());
        int updated = paperMapper.updateStatus(id,
                PaperStatusConstant.PUBLISHED, PaperStatusConstant.DRAFT);
        if (updated == 0) {
            // 并发发布：另一请求已经改变状态，当前事务回滚。
            throw new BaseException(MessageConstant.PAPER_STATUS_TRANSITION_INVALID);
        }
        log.info("发布试卷成功：id={}, questionCount={}, totalScore={}", id, links.size(), totalScore);
    }

    @Override
    @Transactional
    public void archive(Long id) {
        Paper paper = requirePaper(id);
        if (!PaperStatusConstant.PUBLISHED.equals(paper.getStatus())) {
            throw new BaseException(MessageConstant.PAPER_STATUS_TRANSITION_INVALID);
        }
        int updated = paperMapper.updateStatus(id,
                PaperStatusConstant.ARCHIVED, PaperStatusConstant.PUBLISHED);
        if (updated == 0) {
            throw new BaseException(MessageConstant.PAPER_STATUS_TRANSITION_INVALID);
        }
        log.info("归档试卷成功：id={}", id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Paper paper = requirePaper(id);
        if (!PaperStatusConstant.DRAFT.equals(paper.getStatus())) {
            throw new BaseException(MessageConstant.PAPER_DELETE_FORBIDDEN);
        }
        if (paperMapper.countExamsByPaperId(id) > 0) {
            throw new BaseException(MessageConstant.PAPER_IN_USE);
        }
        paperMapper.deleteQuestionsByPaperId(id);
        paperMapper.deleteById(id);
        log.info("删除试卷成功：id={}", id);
    }

    private List<PaperQuestionVO> buildDetailQuestions(Paper paper, List<PaperQuestion> links) {
        if (links.isEmpty()) {
            return List.of();
        }
        Map<Long, Question> questions = loadQuestions(links);
        Map<Long, List<QuestionOption>> options = loadOptions(links);
        boolean published = !PaperStatusConstant.DRAFT.equals(paper.getStatus());
        List<PaperQuestionVO> result = new ArrayList<>(links.size());
        for (PaperQuestion link : links) {
            PaperSnapshotVO snapshot = published ? parseSnapshot(link.getQuestionSnapshot()) : null;
            if (snapshot != null) {
                result.add(toSnapshotVO(link, snapshot));
                continue;
            }
            Question question = questions.get(link.getQuestionId());
            if (question == null) {
                result.add(PaperQuestionVO.builder()
                        .paperQuestionId(link.getId())
                        .questionId(link.getQuestionId())
                        .sort(link.getSort())
                        .score(link.getScore())
                        .content("题目不存在")
                        .options(List.of())
                        .snapshot(false)
                        .build());
                continue;
            }
            result.add(toLiveVO(link, question, options.get(question.getId())));
        }
        return result;
    }

    /**
     * 校验并构建试卷题目：题序按入参顺序生成，同时生成当前内容的快照
     * （paper_question.question_snapshot 为 NOT NULL）。
     *
     * @param allowedDisabledIds 已存在于试卷中的题目，允许题库/题目之后被停用
     */
    private List<PaperQuestion> buildLinks(List<PaperQuestionDTO> dtos,
                                           Set<Long> allowedDisabledIds) {
        if (dtos == null || dtos.isEmpty()) {
            return List.of();
        }
        Set<Long> seen = new HashSet<>();
        for (PaperQuestionDTO dto : dtos) {
            if (dto == null || dto.getQuestionId() == null) {
                throw new BaseException(MessageConstant.PAPER_QUESTION_NOT_FOUND);
            }
            if (!seen.add(dto.getQuestionId())) {
                throw new BaseException(MessageConstant.PAPER_QUESTION_DUPLICATE);
            }
        }

        Map<Long, Question> questions = new HashMap<>();
        for (Question question : questionMapper.listByIds(seen.stream().toList())) {
            questions.put(question.getId(), question);
        }
        if (questions.size() != seen.size()) {
            throw new BaseException(MessageConstant.PAPER_QUESTION_NOT_FOUND);
        }

        Map<Long, List<QuestionOption>> options = new HashMap<>();
        for (QuestionOption option : questionMapper.listOptionsByQuestionIds(seen.stream().toList())) {
            options.computeIfAbsent(option.getQuestionId(), key -> new ArrayList<>()).add(option);
        }

        List<PaperQuestion> links = new ArrayList<>(dtos.size());
        for (int index = 0; index < dtos.size(); index++) {
            PaperQuestionDTO dto = dtos.get(index);
            Question question = questions.get(dto.getQuestionId());
            if (!allowedDisabledIds.contains(dto.getQuestionId())) {
                if (!StatusConstant.ENABLED.equals(question.getStatus())) {
                    throw new BaseException(MessageConstant.PAPER_QUESTION_DISABLED);
                }
                questionBankService.ensureAvailable(question.getQuestionBankId());
            }
            links.add(PaperQuestion.builder()
                    .questionId(question.getId())
                    .sort(index + 1)
                    .score(dto.getScore())
                    .questionSnapshot(serializeSnapshot(question, options.get(question.getId())))
                    .build());
        }
        return links;
    }

    private void insertLinks(Long paperId, List<PaperQuestion> links) {
        if (links.isEmpty()) {
            return;
        }
        for (PaperQuestion link : links) {
            link.setPaperId(paperId);
        }
        paperMapper.insertQuestions(links);
    }

    private void fillQuestionCounts(List<PaperListItemVO> records) {
        List<Long> paperIds = records.stream()
                .map(PaperListItemVO::getId)
                .filter(Objects::nonNull)
                .toList();
        if (paperIds.isEmpty()) {
            return;
        }
        Map<Long, Long> counts = new HashMap<>();
        for (PaperQuestionCountVO count : paperMapper.listQuestionCounts(paperIds)) {
            counts.put(count.getPaperId(), count.getQuestionCount() == null ? 0L : count.getQuestionCount());
        }
        for (PaperListItemVO record : records) {
            record.setQuestionCount(counts.getOrDefault(record.getId(), 0L));
        }
    }

    private Map<Long, Question> loadQuestions(List<PaperQuestion> links) {
        List<Long> ids = links.stream().map(PaperQuestion::getQuestionId).distinct().toList();
        Map<Long, Question> questions = new HashMap<>();
        if (ids.isEmpty()) {
            return questions;
        }
        for (Question question : questionMapper.listByIds(ids)) {
            questions.put(question.getId(), question);
        }
        return questions;
    }

    private Map<Long, List<QuestionOption>> loadOptions(List<PaperQuestion> links) {
        List<Long> ids = links.stream().map(PaperQuestion::getQuestionId).distinct().toList();
        Map<Long, List<QuestionOption>> options = new HashMap<>();
        if (ids.isEmpty()) {
            return options;
        }
        for (QuestionOption option : questionMapper.listOptionsByQuestionIds(ids)) {
            options.computeIfAbsent(option.getQuestionId(), key -> new ArrayList<>()).add(option);
        }
        return options;
    }

    private String serializeSnapshot(Question question, List<QuestionOption> options) {
        PaperSnapshotVO snapshot = PaperSnapshotVO.builder()
                .version(PaperSnapshotVO.CURRENT_VERSION)
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .imageUrl(trimToEmpty(question.getImageUrl()))
                .analysis(trimToEmpty(question.getAnalysis()))
                .options(toOptionVOs(options))
                .build();
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JacksonException e) {
            log.error("序列化试卷快照失败：questionId={}", question.getId(), e);
            throw new BaseException(MessageConstant.PAPER_SNAPSHOT_FAILED, e);
        }
    }

    private PaperSnapshotVO parseSnapshot(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, PaperSnapshotVO.class);
        } catch (JacksonException e) {
            log.warn("解析试卷快照失败，回退到实时题目内容：{}", e.getMessage());
            return null;
        }
    }

    private PaperQuestionVO toSnapshotVO(PaperQuestion link, PaperSnapshotVO snapshot) {
        return PaperQuestionVO.builder()
                .paperQuestionId(link.getId())
                .questionId(link.getQuestionId())
                .sort(link.getSort())
                .score(link.getScore())
                .questionType(snapshot.getQuestionType())
                .difficulty(snapshot.getDifficulty())
                .content(snapshot.getContent())
                .imageUrl(snapshot.getImageUrl())
                .analysis(snapshot.getAnalysis())
                .options(snapshot.getOptions() == null ? List.of() : snapshot.getOptions())
                .snapshot(true)
                .build();
    }

    private PaperQuestionVO toLiveVO(PaperQuestion link,
                                     Question question,
                                     List<QuestionOption> options) {
        return PaperQuestionVO.builder()
                .paperQuestionId(link.getId())
                .questionId(question.getId())
                .sort(link.getSort())
                .score(link.getScore())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .imageUrl(question.getImageUrl())
                .analysis(question.getAnalysis())
                .options(toOptionVOs(options))
                .snapshot(false)
                .build();
    }

    private List<QuestionOptionVO> toOptionVOs(List<QuestionOption> options) {
        if (options == null || options.isEmpty()) {
            return List.of();
        }
        return options.stream()
                .map(option -> QuestionOptionVO.builder()
                        .id(option.getId())
                        .optionKey(option.getOptionKey())
                        .content(option.getContent())
                        .imageUrl(option.getImageUrl())
                        .isCorrect(option.getIsCorrect())
                        .build())
                .toList();
    }

    private BigDecimal sumScore(List<PaperQuestion> links) {
        BigDecimal total = BigDecimal.ZERO;
        for (PaperQuestion link : links) {
            total = total.add(link.getScore());
        }
        return total;
    }

    private Paper requirePaper(Long id) {
        Paper paper = paperMapper.getById(id);
        if (paper == null) {
            throw new BaseException(MessageConstant.PAPER_NOT_FOUND);
        }
        return paper;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
