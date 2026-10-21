package com.saas.ilearning.service;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.QuestionQueryDTO;
import com.saas.ilearning.dto.QuestionSaveDTO;
import com.saas.ilearning.vo.QuestionDetailVO;
import com.saas.ilearning.vo.QuestionListItemVO;

public interface QuestionService {

    PageResult<QuestionListItemVO> page(QuestionQueryDTO query);

    QuestionDetailVO detail(Long id);

    Long create(QuestionSaveDTO dto);

    void update(Long id, QuestionSaveDTO dto);

    void delete(Long id);

    Long copy(Long id);
}
