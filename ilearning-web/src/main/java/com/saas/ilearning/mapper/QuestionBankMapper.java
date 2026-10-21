package com.saas.ilearning.mapper;

import com.saas.ilearning.entity.QuestionBank;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QuestionBankMapper {

    List<QuestionBankBriefVO> listAvailable();

    List<QuestionBankBriefVO> listBriefsByIds(@Param("ids") List<Long> ids);

    QuestionBank getById(@Param("id") Long id);
}
