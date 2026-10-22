package com.saas.ilearning.mapper;

import com.saas.ilearning.dto.ExamQueryDTO;
import com.saas.ilearning.entity.Exam;
import com.saas.ilearning.vo.ExamVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExamMapper {

    List<ExamVO> page(@Param("q") ExamQueryDTO query);

    long count(@Param("q") ExamQueryDTO query);

    Exam getById(@Param("id") Long id);

    ExamVO getVOById(@Param("id") Long id);

    int insert(Exam exam);

    int updateDraft(@Param("exam") Exam exam, @Param("expectedStatus") Integer expectedStatus);

    int updateStatus(@Param("id") Long id,
                     @Param("status") Integer status,
                     @Param("expectedStatus") Integer expectedStatus);

    int deleteById(@Param("id") Long id, @Param("expectedStatus") Integer expectedStatus);

    long countAttemptsByExamId(@Param("examId") Long examId);
}
