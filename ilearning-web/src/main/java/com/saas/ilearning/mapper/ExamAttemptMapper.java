package com.saas.ilearning.mapper;

import com.saas.ilearning.dto.AttemptHistoryQueryDTO;
import com.saas.ilearning.dto.UserExamQueryDTO;
import com.saas.ilearning.entity.ExamAttempt;
import com.saas.ilearning.vo.AttemptHistoryVO;
import com.saas.ilearning.vo.UserExamVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ExamAttemptMapper {

    ExamAttempt findInProgress(@Param("userId") Long userId, @Param("examId") Long examId);

    List<ExamAttempt> listExpiredInProgress(@Param("userId") Long userId,
                                            @Param("now") LocalDateTime now);

    int countEffectiveAttempts(@Param("userId") Long userId, @Param("examId") Long examId);

    int maxAttemptNo(@Param("userId") Long userId, @Param("examId") Long examId);

    int insert(ExamAttempt attempt);

    ExamAttempt getById(@Param("id") Long id);

    ExamAttempt getByIdForUpdate(@Param("id") Long id);

    int finalizeAttempt(@Param("id") Long id,
                        @Param("status") Integer status,
                        @Param("userScore") BigDecimal userScore,
                        @Param("isPassed") Boolean isPassed,
                        @Param("submittedAt") LocalDateTime submittedAt,
                        @Param("gradedAt") LocalDateTime gradedAt,
                        @Param("timeSpentSeconds") Integer timeSpentSeconds,
                        @Param("expectedStatus") Integer expectedStatus);

    List<UserExamVO> listAvailable(@Param("userId") Long userId,
                                      @Param("q") UserExamQueryDTO query,
                                      @Param("now") LocalDateTime now);

    long countAvailable(@Param("userId") Long userId,
                        @Param("q") UserExamQueryDTO query,
                        @Param("now") LocalDateTime now);

    List<AttemptHistoryVO> listHistory(@Param("userId") Long userId,
                                       @Param("q") AttemptHistoryQueryDTO query);

    long countHistory(@Param("userId") Long userId);
}
