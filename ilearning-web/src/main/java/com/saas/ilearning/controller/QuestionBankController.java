package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/question-banks")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    public QuestionBankController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    @GetMapping("/available")
    public Result<List<QuestionBankBriefVO>> listAvailable() {
        return Result.success(questionBankService.listAvailable());
    }
}
