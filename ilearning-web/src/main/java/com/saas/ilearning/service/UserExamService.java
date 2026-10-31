package com.saas.ilearning.service;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.AttemptHistoryQueryDTO;
import com.saas.ilearning.dto.UserExamQueryDTO;
import com.saas.ilearning.vo.AttemptHistoryVO;
import com.saas.ilearning.vo.UserExamVO;

public interface UserExamService {

    PageResult<UserExamVO> listAvailable(UserExamQueryDTO query);

    PageResult<AttemptHistoryVO> listHistory(AttemptHistoryQueryDTO query);
}
