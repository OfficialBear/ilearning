package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.QuestionQueryDTO;
import com.saas.ilearning.dto.QuestionSaveDTO;
import com.saas.ilearning.service.QuestionService;
import com.saas.ilearning.vo.QuestionDetailVO;
import com.saas.ilearning.vo.QuestionListItemVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public Result<PageResult<QuestionListItemVO>> page(@Valid QuestionQueryDTO query) {
        return Result.success(questionService.page(query));
    }

    @GetMapping("/{id}")
    public Result<QuestionDetailVO> detail(@PathVariable Long id) {
        return Result.success(questionService.detail(id));
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody QuestionSaveDTO dto) {
        return Result.success(questionService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody QuestionSaveDTO dto) {
        questionService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        questionService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/copy")
    public Result<Long> copy(@PathVariable Long id) {
        return Result.success(questionService.copy(id));
    }
}
