package com.saas.ilearning.service;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.QuestionBankQueryDTO;
import com.saas.ilearning.dto.QuestionBankSaveDTO;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import com.saas.ilearning.vo.QuestionBankListItemVO;

import java.util.Collection;
import java.util.List;

public interface QuestionBankService {

    PageResult<QuestionBankListItemVO> page(QuestionBankQueryDTO query);

    Long create(QuestionBankSaveDTO dto);

    void update(Long id, QuestionBankSaveDTO dto);

    void updateStatus(Long id, Integer status);

    void delete(Long id);

    List<QuestionBankBriefVO> listAvailable();

    List<QuestionBankBriefVO> listBriefsByIds(Collection<Long> ids);

    void ensureAvailable(Long questionBankId);
}
