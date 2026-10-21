package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.constant.MessageConstant;
import com.saas.ilearning.common.constant.StatusConstant;
import com.saas.ilearning.common.exception.BaseException;
import com.saas.ilearning.entity.QuestionBank;
import com.saas.ilearning.mapper.QuestionBankMapper;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Service
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankMapper questionBankMapper;

    public QuestionBankServiceImpl(QuestionBankMapper questionBankMapper) {
        this.questionBankMapper = questionBankMapper;
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
}
