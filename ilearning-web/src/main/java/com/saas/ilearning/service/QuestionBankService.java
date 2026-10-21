package com.saas.ilearning.service;

import com.saas.ilearning.vo.QuestionBankBriefVO;

import java.util.Collection;
import java.util.List;

public interface QuestionBankService {

    List<QuestionBankBriefVO> listAvailable();

    List<QuestionBankBriefVO> listBriefsByIds(Collection<Long> ids);

    void ensureAvailable(Long questionBankId);
}
