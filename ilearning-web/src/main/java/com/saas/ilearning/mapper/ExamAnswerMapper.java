package com.saas.ilearning.mapper;

import com.saas.ilearning.entity.ExamAnswer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface ExamAnswerMapper {

    List<ExamAnswer> listByAttemptId(@Param("attemptId") Long attemptId);

    int upsert(ExamAnswer answer);

    int deleteAnswer(@Param("attemptId") Long attemptId,
                     @Param("paperQuestionId") Long paperQuestionId);

    int updateGrade(@Param("id") Long id,
                    @Param("isCorrect") Boolean isCorrect,
                    @Param("actualScore") BigDecimal actualScore);
}
