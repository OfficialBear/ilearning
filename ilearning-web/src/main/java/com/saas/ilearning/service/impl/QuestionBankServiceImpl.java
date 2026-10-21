package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.StatusConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.QuestionBankQueryDTO;
import com.saas.ilearning.dto.QuestionBankSaveDTO;
import com.saas.ilearning.entity.QuestionBank;
import com.saas.ilearning.mapper.QuestionBankMapper;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import com.saas.ilearning.vo.QuestionBankListItemVO;
import com.saas.ilearning.vo.QuestionBankQuestionStatVO;
import com.saas.ilearning.vo.QuestionBankTypeCountVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankMapper questionBankMapper;

    public QuestionBankServiceImpl(QuestionBankMapper questionBankMapper) {
        this.questionBankMapper = questionBankMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<QuestionBankListItemVO> page(QuestionBankQueryDTO query) {
        if (query == null) {
            query = new QuestionBankQueryDTO();
        }
        int page = query.getPage() == null || query.getPage() < 1 ? 1 : query.getPage();
        int pageSize = query.getPageSize() == null || query.getPageSize() < 1
                ? 10 : Math.min(query.getPageSize(), 100);
        query.setPage(page);
        query.setPageSize(pageSize);
        if (query.getStatus() != null) {
            validateStatus(query.getStatus());
        }
        String keyword = query.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            query.setKeyword(keyword.isEmpty() ? null : keyword);
        }

        long total = questionBankMapper.count(query);
        if (total == 0) {
            return new PageResult<>(0, List.of());
        }
        List<QuestionBankListItemVO> records = questionBankMapper.page(query);
        fillStatistics(records);
        return new PageResult<>(total, records);
    }

    @Override
    @Transactional
    public Long create(QuestionBankSaveDTO dto) {
        if (dto.getStatus() != null) {
            validateStatus(dto.getStatus());
        }
        QuestionBank questionBank = QuestionBank.builder()
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .sort(dto.getSort() == null ? 0 : dto.getSort())
                .status(dto.getStatus() == null ? StatusConstant.ENABLED : dto.getStatus())
                .build();
        questionBankMapper.insert(questionBank);
        log.info("创建题库成功：id={}", questionBank.getId());
        return questionBank.getId();
    }

    @Override
    @Transactional
    public void update(Long id, QuestionBankSaveDTO dto) {
        QuestionBank existing = requireBank(id);
        if (dto.getStatus() != null) {
            validateStatus(dto.getStatus());
        }
        QuestionBank update = QuestionBank.builder()
                .id(id)
                .title(dto.getTitle().trim())
                .description(trimToEmpty(dto.getDescription()))
                .sort(dto.getSort() == null ? existing.getSort() : dto.getSort())
                .status(dto.getStatus() == null ? existing.getStatus() : dto.getStatus())
                .build();
        questionBankMapper.update(update);
        log.info("更新题库成功：id={}", id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Integer status) {
        validateStatus(status);
        requireBank(id);
        questionBankMapper.updateStatus(id, status);
        log.info("更新题库状态成功：id={}, status={}", id, status);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        requireBank(id);
        long questionCount = questionBankMapper.countQuestions(id);
        if (questionCount > 0) {
            throw new BaseException(MessageConstant.QUESTION_BANK_HAS_QUESTIONS);
        }
        questionBankMapper.deleteById(id);
        log.info("删除题库成功：id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionBankBriefVO> listAvailable() {
        return questionBankMapper.listAvailable();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionBankBriefVO> listBriefsByIds(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<Long> distinctIds = ids.stream().filter(Objects::nonNull).distinct().toList();
        if (distinctIds.isEmpty()) {
            return List.of();
        }
        return questionBankMapper.listBriefsByIds(distinctIds);
    }

    @Override
    @Transactional(readOnly = true)
    public void ensureAvailable(Long questionBankId) {
        if (questionBankId == null) {
            return;
        }
        QuestionBank bank = questionBankMapper.getById(questionBankId);
        if (bank == null) {
            throw new BaseException(MessageConstant.QUESTION_BANK_NOT_FOUND);
        }
        if (!StatusConstant.ENABLED.equals(bank.getStatus())) {
            throw new BaseException(MessageConstant.QUESTION_BANK_DISABLED);
        }
    }

    /**
     * 一次性汇总当前页题库的题目总数、启用题目数与题型分布，避免逐行查询。
     */
    private void fillStatistics(List<QuestionBankListItemVO> records) {
        List<Long> bankIds = records.stream()
                .map(QuestionBankListItemVO::getId)
                .filter(Objects::nonNull)
                .toList();
        if (bankIds.isEmpty()) {
            return;
        }

        Map<Long, List<QuestionBankQuestionStatVO>> statsByBank = new HashMap<>();
        for (QuestionBankQuestionStatVO stat : questionBankMapper.listQuestionStats(bankIds)) {
            statsByBank.computeIfAbsent(stat.getBankId(), key -> new ArrayList<>()).add(stat);
        }

        for (QuestionBankListItemVO record : records) {
            List<QuestionBankQuestionStatVO> stats =
                    statsByBank.getOrDefault(record.getId(), List.of());
            long totalQuestions = 0;
            long enabledQuestions = 0;
            List<QuestionBankTypeCountVO> typeCounts = new ArrayList<>();
            for (QuestionBankQuestionStatVO stat : stats) {
                long statTotal = stat.getTotal() == null ? 0 : stat.getTotal();
                long statEnabled = stat.getEnabled() == null ? 0 : stat.getEnabled();
                totalQuestions += statTotal;
                enabledQuestions += statEnabled;
                if (statTotal > 0) {
                    typeCounts.add(QuestionBankTypeCountVO.builder()
                            .questionType(stat.getQuestionType())
                            .total(statTotal)
                            .build());
                }
            }
            record.setTotalQuestions(totalQuestions);
            record.setEnabledQuestions(enabledQuestions);
            record.setQuestionTypeCounts(typeCounts);
        }
    }

    private QuestionBank requireBank(Long id) {
        QuestionBank questionBank = questionBankMapper.getById(id);
        if (questionBank == null) {
            throw new BaseException(MessageConstant.QUESTION_BANK_NOT_FOUND);
        }
        return questionBank;
    }

    private static void validateStatus(Integer status) {
        if (!StatusConstant.ENABLED.equals(status) && !StatusConstant.DISABLED.equals(status)) {
            throw new BaseException(MessageConstant.QUESTION_BANK_STATUS_INVALID);
        }
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
