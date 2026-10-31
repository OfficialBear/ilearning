package com.saas.ilearning.service.impl;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.dto.AttemptHistoryQueryDTO;
import com.saas.ilearning.dto.UserExamQueryDTO;
import com.saas.ilearning.mapper.ExamAttemptMapper;
import com.saas.ilearning.security.CurrentUserProvider;
import com.saas.ilearning.service.ExamAttemptService;
import com.saas.ilearning.service.UserExamService;
import com.saas.ilearning.vo.AttemptHistoryVO;
import com.saas.ilearning.vo.UserExamVO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserExamServiceImpl implements UserExamService {

    private final ExamAttemptMapper attemptMapper;
    private final ExamAttemptService attemptService;

    public UserExamServiceImpl(ExamAttemptMapper attemptMapper,
                                  ExamAttemptService attemptService) {
        this.attemptMapper = attemptMapper;
        this.attemptService = attemptService;
    }

    @Override
    public PageResult<UserExamVO> listAvailable(UserExamQueryDTO query) {
        Long userId = CurrentUserProvider.requireCurrentUser().getUserId();
        attemptService.finalizeExpiredAttempts(userId);
        UserExamQueryDTO normalized = normalize(query);
        LocalDateTime now = LocalDateTime.now();
        long total = attemptMapper.countAvailable(userId, normalized, now);
        if (total == 0) {
            return new PageResult<>(0, List.of());
        }
        List<UserExamVO> records = attemptMapper.listAvailable(userId, normalized, now);
        for (UserExamVO record : records) {
            boolean exhausted = record.getMaxAttempts() != null
                    && record.getMaxAttempts() > 0
                    && record.getAttemptsUsed() != null
                    && record.getAttemptsUsed() >= record.getMaxAttempts();
            record.setExhausted(exhausted);
            record.setCanStart(record.getInProgressAttemptId() != null || !exhausted);
        }
        return new PageResult<>(total, records);
    }

    @Override
    public PageResult<AttemptHistoryVO> listHistory(AttemptHistoryQueryDTO query) {
        Long userId = CurrentUserProvider.requireCurrentUser().getUserId();
        attemptService.finalizeExpiredAttempts(userId);
        AttemptHistoryQueryDTO normalized = normalize(query);
        long total = attemptMapper.countHistory(userId);
        if (total == 0) {
            return new PageResult<>(0, List.of());
        }
        return new PageResult<>(total, attemptMapper.listHistory(userId, normalized));
    }

    private UserExamQueryDTO normalize(UserExamQueryDTO query) {
        UserExamQueryDTO result = query == null ? new UserExamQueryDTO() : query;
        int page = result.getPage() == null || result.getPage() < 1 ? 1 : result.getPage();
        int pageSize = result.getPageSize() == null || result.getPageSize() < 1
                ? 6 : Math.min(result.getPageSize(), 100);
        result.setPage(page);
        result.setPageSize(pageSize);
        String keyword = result.getKeyword();
        if (keyword != null) {
            keyword = keyword.trim();
            result.setKeyword(keyword.isEmpty() ? null : keyword);
        }
        return result;
    }

    private AttemptHistoryQueryDTO normalize(AttemptHistoryQueryDTO query) {
        AttemptHistoryQueryDTO result = query == null ? new AttemptHistoryQueryDTO() : query;
        int page = result.getPage() == null || result.getPage() < 1 ? 1 : result.getPage();
        int pageSize = result.getPageSize() == null || result.getPageSize() < 1
                ? 10 : Math.min(result.getPageSize(), 100);
        result.setPage(page);
        result.setPageSize(pageSize);
        return result;
    }
}
