package com.saas.ilearning.service;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.ExamQueryDTO;
import com.saas.ilearning.dto.ExamSaveDTO;
import com.saas.ilearning.vo.ExamVO;

public interface ExamService {

    PageResult<ExamVO> page(ExamQueryDTO query);

    ExamVO detail(Long id);

    Long create(ExamSaveDTO dto);

    void update(Long id, ExamSaveDTO dto);

    /**
     * 草稿 -> 已发布：再次校验试卷可用性与考试规则。
     */
    void publish(Long id);

    /**
     * 已发布 -> 已关闭：停止接受新的考试。
     */
    void close(Long id);

    void delete(Long id);
}
