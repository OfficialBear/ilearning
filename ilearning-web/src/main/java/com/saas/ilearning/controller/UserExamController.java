package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.AnswerSaveDTO;
import com.saas.ilearning.dto.AttemptHistoryQueryDTO;
import com.saas.ilearning.dto.UserExamQueryDTO;
import com.saas.ilearning.service.ExamAttemptService;
import com.saas.ilearning.service.UserExamService;
import com.saas.ilearning.vo.AttemptHistoryVO;
import com.saas.ilearning.vo.AttemptPaperVO;
import com.saas.ilearning.vo.AttemptResultVO;
import com.saas.ilearning.vo.UserExamVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserExamController {

    private final UserExamService userExamService;
    private final ExamAttemptService examAttemptService;

    public UserExamController(UserExamService userExamService,
                             ExamAttemptService examAttemptService) {
        this.userExamService = userExamService;
        this.examAttemptService = examAttemptService;
    }

    @GetMapping("/exams")
    public Result<PageResult<UserExamVO>> availableExams(@Valid UserExamQueryDTO query) {
        return Result.success(userExamService.listAvailable(query));
    }

    @PostMapping("/exams/{examId}/attempts")
    public Result<AttemptPaperVO> start(@PathVariable Long examId) {
        return Result.success(examAttemptService.start(examId));
    }

    @GetMapping("/attempts")
    public Result<PageResult<AttemptHistoryVO>> history(@Valid AttemptHistoryQueryDTO query) {
        return Result.success(userExamService.listHistory(query));
    }

    @GetMapping("/attempts/{attemptId}")
    public Result<AttemptPaperVO> paper(@PathVariable Long attemptId) {
        return Result.success(examAttemptService.paper(attemptId));
    }

    @PutMapping("/attempts/{attemptId}/answers")
    public Result<Void> saveAnswer(@PathVariable Long attemptId,
                                   @Valid @RequestBody AnswerSaveDTO dto) {
        examAttemptService.saveAnswer(attemptId, dto);
        return Result.success();
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public Result<AttemptResultVO> submit(@PathVariable Long attemptId) {
        return Result.success(examAttemptService.submit(attemptId));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public Result<AttemptResultVO> result(@PathVariable Long attemptId) {
        return Result.success(examAttemptService.result(attemptId));
    }
}
