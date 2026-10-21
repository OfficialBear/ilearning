package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.QuestionBankQueryDTO;
import com.saas.ilearning.dto.QuestionBankSaveDTO;
import com.saas.ilearning.dto.QuestionBankStatusDTO;
import com.saas.ilearning.service.QuestionBankService;
import com.saas.ilearning.vo.QuestionBankBriefVO;
import com.saas.ilearning.vo.QuestionBankListItemVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping
    public Result<PageResult<QuestionBankListItemVO>> page(@Valid QuestionBankQueryDTO query) {
        return Result.success(questionBankService.page(query));
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody QuestionBankSaveDTO dto) {
        return Result.success(questionBankService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody QuestionBankSaveDTO dto) {
        questionBankService.update(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody QuestionBankStatusDTO dto) {
        questionBankService.updateStatus(id, dto.getStatus());
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        questionBankService.delete(id);
        return Result.success();
    }

    @GetMapping("/available")
    public Result<List<QuestionBankBriefVO>> listAvailable() {
        return Result.success(questionBankService.listAvailable());
    }
}
