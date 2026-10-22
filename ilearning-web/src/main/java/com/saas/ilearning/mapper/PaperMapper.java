package com.saas.ilearning.mapper;

import com.saas.ilearning.dto.PaperQueryDTO;
import com.saas.ilearning.entity.Paper;
import com.saas.ilearning.entity.PaperQuestion;
import com.saas.ilearning.vo.PaperListItemVO;
import com.saas.ilearning.vo.PaperQuestionCountVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaperMapper {

    List<PaperListItemVO> page(@Param("q") PaperQueryDTO query);

    long count(@Param("q") PaperQueryDTO query);

    Paper getById(@Param("id") Long id);

    int insert(Paper paper);

    int update(Paper paper);

    int updateStatus(@Param("id") Long id,
                     @Param("status") Integer status,
                     @Param("expectedStatus") Integer expectedStatus);

    int deleteById(@Param("id") Long id);

    List<PaperQuestion> listQuestionsByPaperId(@Param("paperId") Long paperId);

    int deleteQuestionsByPaperId(@Param("paperId") Long paperId);

    int insertQuestions(@Param("questions") List<PaperQuestion> questions);

    int updateQuestionSnapshot(@Param("paperId") Long paperId,
                               @Param("questionId") Long questionId,
                               @Param("snapshot") String snapshot);

    List<PaperQuestionCountVO> listQuestionCounts(@Param("paperIds") List<Long> paperIds);

    long countExamsByPaperId(@Param("paperId") Long paperId);
}
