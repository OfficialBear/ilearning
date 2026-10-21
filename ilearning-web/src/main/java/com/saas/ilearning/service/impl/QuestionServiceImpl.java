package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.QuestionDifficultyConstant;
import com.saas.ilearning.common.constant.QuestionTypeConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.QuestionOptionDTO;
import com.saas.ilearning.dto.QuestionQueryDTO;
import com.saas.ilearning.dto.QuestionSaveDTO;
import com.saas.ilearning.entity.Question;
import com.saas.ilearning.entity.QuestionOption;
import com.saas.ilearning.mapper.QuestionMapper;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.service.QuestionService;
import com.saas.ilearning.service.QuestionValidator;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import com.saas.ilearning.vo.QuestionDetailVO;
import com.saas.ilearning.vo.QuestionListItemVO;
import com.saas.ilearning.vo.QuestionOptionVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class QuestionServiceImpl implements QuestionService {

    private final QuestionMapper questionMapper;
    private final QuestionBankService questionBankService;
    private final QuestionValidator questionValidator;

    public QuestionServiceImpl(QuestionMapper questionMapper,
                               QuestionBankService questionBankService,
                               QuestionValidator questionValidator) {
        this.questionMapper = questionMapper;
        this.questionBankService = questionBankService;
        this.questionValidator = questionValidator;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<QuestionListItemVO> page(QuestionQueryDTO query) {
        if (query == null) {
            query = new QuestionQueryDTO();
        }
        int page = query.getPage() == null || query.getPage() < 1 ? 1 : query.getPage();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1
                ? 10 : Math.min(query.getPageSize(), 100);
        query.setPage(page);
        query.setPageSize(pageSize);
        if (query.getQuestionType() != null && !QuestionTypeConstant.isValid(query.getQuestionType())) {
            throw new BaseException(MessageConstant.QUESTION_TYPE_INVALID);
        }
        if (query.getDifficulty() != null && !QuestionDifficultyConstant.isValid(query.getDifficulty())) {
            throw new BaseException(MessageConstant.QUESTION_DIFFICULTY_INVALID);
        }
        String keyword = query.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            query.setKeyword(keyword.isEmpty() ? null : keyword);
        }

        long total = questionMapper.count(query);
        if (total == 0) {
            return new PageResult<>(0, List.<QuestionListItemVO>of());
        }
        List<QuestionListItemVO> records = questionMapper.page(query);
        if (records.isEmpty()) {
            return new PageResult<>(total, records);
        }

        List<Long> questionBankIds = records.stream()
                .map(QuestionListItemVO::getQuestionBankId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, QuestionBankBriefVO> banksById = new HashMap<>();
        for (QuestionBankBriefVO bank : questionBankService.listBriefsByIds(questionBankIds)) {
            banksById.put(bank.getId(), bank);
        }
        for (QuestionListItemVO record : records) {
            record.setQuestionBank(record.getQuestionBankId() == null
                    ? null
                    : banksById.get(record.getQuestionBankId()));
        }
        return new PageResult<>(total, records);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionDetailVO detail(Long id) {
        Question question = requireQuestion(id);
        List<QuestionOption> options = questionMapper.listOptionsByQuestionId(id);
        long references = questionMapper.countPaperReferences(id);
        QuestionBankBriefVO bank = null;
        if (question.getQuestionBankId() != null) {
            bank = questionBankService.listBriefsByIds(List.of(question.getQuestionBankId()))
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        return QuestionDetailVO.builder()
                .id(question.getId())
                .questionBankId(question.getQuestionBankId())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .imageUrl(question.getImageUrl())
                .analysis(question.getAnalysis())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .paperReferenceCount(references)
                .questionBank(bank)
                .options(options.stream().map(this::toOptionVO).toList())
                .build();
    }

    @Override
    @Transactional
    public Long create(QuestionSaveDTO dto) {
        questionValidator.validate(dto);
        questionBankService.ensureAvailable(dto.getQuestionBankId());
        Question question = buildQuestion(null, dto);
        questionMapper.insert(question);
        insertOptions(question.getId(), dto.getOptions());
        log.info("创建试题成功：id={}, questionType={}", question.getId(), dto.getQuestionType());
        return question.getId();
    }

    @Override
    @Transactional
    public void update(Long id, QuestionSaveDTO dto) {
        Question existing = requireQuestion(id);
        questionValidator.validate(dto);
        questionBankService.ensureAvailable(dto.getQuestionBankId());

        long references = questionMapper.countPaperReferences(id);
        if (references > 0) {
            List<QuestionOption> existingOptions = questionMapper.listOptionsByQuestionId(id);
            if (!protectedFieldsUnchanged(existing, existingOptions, dto)) {
                throw new BaseException(MessageConstant.QUESTION_IN_USE_EDIT_FORBIDDEN);
            }
            Question update = Question.builder()
                    .id(id)
                    .questionBankId(dto.getQuestionBankId())
                    .questionType(existing.getQuestionType())
                    .difficulty(dto.getDifficulty())
                    .imageUrl(existing.getImageUrl())
                    .content(existing.getContent())
                    .analysis(trimToEmpty(dto.getAnalysis()))
                    .build();
            questionMapper.update(update);
            log.info("更新被引用试题的元信息：id={}, references={}", id, references);
            return;
        }

        Question update = buildQuestion(id, dto);
        questionMapper.update(update);
        questionMapper.deleteOptionsByQuestionId(id);
        insertOptions(id, dto.getOptions());
        log.info("更新试题成功：id={}", id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        requireQuestion(id);
        if (questionMapper.countPaperReferences(id) > 0) {
            throw new BaseException(MessageConstant.QUESTION_IN_USE);
        }
        questionMapper.deleteOptionsByQuestionId(id);
        questionMapper.deleteById(id);
        log.info("删除试题成功：id={}", id);
    }

    @Override
    @Transactional
    public Long copy(Long id) {
        Question source = requireQuestion(id);
        List<QuestionOption> sourceOptions = questionMapper.listOptionsByQuestionId(id);

        Question copy = Question.builder()
                .questionBankId(source.getQuestionBankId())
                .questionType(source.getQuestionType())
                .difficulty(source.getDifficulty())
                .imageUrl(source.getImageUrl())
                .content(source.getContent())
                .analysis(source.getAnalysis())
                .build();
        questionMapper.insert(copy);

        if (!sourceOptions.isEmpty()) {
            List<QuestionOption> copiedOptions = sourceOptions.stream()
                    .map(option -> QuestionOption.builder()
                            .questionId(copy.getId())
                            .optionKey(option.getOptionKey())
                            .content(option.getContent())
                            .imageUrl(option.getImageUrl())
                            .isCorrect(option.getIsCorrect())
                            .build())
                    .toList();
            questionMapper.insertOptions(copiedOptions);
        }
        log.info("复制试题成功：sourceId={}, newId={}", id, copy.getId());
        return copy.getId();
    }

    private Question requireQuestion(Long id) {
        Question question = questionMapper.getById(id);
        if (question == null) {
            throw new BaseException(MessageConstant.QUESTION_NOT_FOUND);
        }
        return question;
    }

    private Question buildQuestion(Long id, QuestionSaveDTO dto) {
        return Question.builder()
                .id(id)
                .questionBankId(dto.getQuestionBankId())
                .questionType(dto.getQuestionType())
                .difficulty(dto.getDifficulty())
                .imageUrl(trimToEmpty(dto.getImageUrl()))
                .content(trimToEmpty(dto.getContent()))
                .analysis(trimToEmpty(dto.getAnalysis()))
                .build();
    }

    private void insertOptions(Long questionId, List<QuestionOptionDTO> options) {
        if (options == null || options.isEmpty()) {
            return;
        }
        List<QuestionOption> entities = new ArrayList<>(options.size());
        for (int index = 0; index < options.size(); index++) {
            QuestionOptionDTO option = options.get(index);
            entities.add(QuestionOption.builder()
                    .questionId(questionId)
                    // 选项标识按展示顺序生成 A/B/C...，与 question_option.uk_key 对齐
                    .optionKey(String.valueOf((char) ('A' + index)))
                    .content(trimToEmpty(option.getContent()))
                    .imageUrl(trimToEmpty(option.getImageUrl()))
                    .isCorrect(option.getIsCorrect())
                    .build());
        }
        questionMapper.insertOptions(entities);
    }

    private boolean protectedFieldsUnchanged(Question existing,
                                             List<QuestionOption> existingOptions,
                                             QuestionSaveDTO dto) {
        if (!Objects.equals(existing.getQuestionType(), dto.getQuestionType())) {
            return false;
        }
        if (!Objects.equals(trimToEmpty(existing.getContent()), trimToEmpty(dto.getContent()))) {
            return false;
        }
        if (!Objects.equals(trimToEmpty(existing.getImageUrl()), trimToEmpty(dto.getImageUrl()))) {
            return false;
        }

        List<QuestionOptionDTO> incoming = dto.getOptions() == null ? List.of() : dto.getOptions();
        if (existingOptions.size() != incoming.size()) {
            return false;
        }
        for (int i = 0; i < existingOptions.size(); i++) {
            QuestionOption current = existingOptions.get(i);
            QuestionOptionDTO next = incoming.get(i);
            if (!Objects.equals(trimToEmpty(current.getContent()), trimToEmpty(next.getContent()))) {
                return false;
            }
            if (!Objects.equals(trimToEmpty(current.getImageUrl()), trimToEmpty(next.getImageUrl()))) {
                return false;
            }
            if (!Objects.equals(current.getIsCorrect(), next.getIsCorrect())) {
                return false;
            }
        }
        return true;
    }

    private QuestionOptionVO toOptionVO(QuestionOption option) {
        return QuestionOptionVO.builder()
                .id(option.getId())
                .optionKey(option.getOptionKey())
                .content(option.getContent())
                .imageUrl(option.getImageUrl())
                .isCorrect(option.getIsCorrect())
                .build();
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
