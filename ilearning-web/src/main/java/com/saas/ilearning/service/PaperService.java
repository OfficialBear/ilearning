package com.saas.ilearning.service;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.PaperQueryDTO;
import com.saas.ilearning.dto.PaperSaveDTO;
import com.saas.ilearning.vo.PaperDetailVO;
import com.saas.ilearning.vo.PaperListItemVO;

public interface PaperService {

    PageResult<PaperListItemVO> page(PaperQueryDTO query);

    PaperDetailVO detail(Long id);

    Long create(PaperSaveDTO dto);

    void update(Long id, PaperSaveDTO dto);

    /**
     * 草稿 -> 已发布：冻结题目集合与分值，并重新生成题目快照。
     */
    void publish(Long id);

    /**
     * 已发布 -> 已归档。
     */
    void archive(Long id);

    void delete(Long id);
}
