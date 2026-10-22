package com.saas.ilearning.mapper;

import com.saas.ilearning.dto.QuestionQueryDTO;
import com.saas.ilearning.entity.Question;
import com.saas.ilearning.entity.QuestionOption;
import com.saas.ilearning.vo.QuestionListItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QuestionMapper {

    int insert(Question question);

    int update(Question question);

    Question getById(@Param("id") Long id);

    List<QuestionListItemVO> page(@Param("q") QuestionQueryDTO query);

    long count(@Param("q") QuestionQueryDTO query);

    int deleteById(@Param("id") Long id);

    int insertOptions(@Param("options") List<QuestionOption> options);

    int deleteOptionsByQuestionId(@Param("questionId") Long questionId);

    List<QuestionOption> listOptionsByQuestionId(@Param("questionId") Long questionId);

    List<Question> listByIds(@Param("ids") List<Long> ids);

    List<QuestionOption> listOptionsByQuestionIds(@Param("ids") List<Long> ids);

    long countPaperReferences(@Param("questionId") Long questionId);
}
