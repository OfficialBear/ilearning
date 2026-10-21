package com.saas.ilearning.mapper;

import com.saas.ilearning.dto.QuestionBankQueryDTO;
import com.saas.ilearning.entity.QuestionBank;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import com.saas.ilearning.vo.QuestionBankListItemVO;
import com.saas.ilearning.vo.QuestionBankQuestionStatVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QuestionBankMapper {

    List<QuestionBankBriefVO> listAvailable();

    List<QuestionBankBriefVO> listBriefsByIds(@Param("ids") List<Long> ids);

    QuestionBank getById(@Param("id") Long id);

    List<QuestionBankListItemVO> page(@Param("q") QuestionBankQueryDTO query);

    long count(@Param("q") QuestionBankQueryDTO query);

    int insert(QuestionBank questionBank);

    int update(QuestionBank questionBank);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int deleteById(@Param("id") Long id);

    long countQuestions(@Param("bankId") Long bankId);

    List<QuestionBankQuestionStatVO> listQuestionStats(@Param("bankIds") List<Long> bankIds);
}
