package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.ExamQueryDTO;
import com.saas.ilearning.dto.ExamSaveDTO;
import com.saas.ilearning.service.ExamService;
import com.saas.ilearning.vo.ExamVO;
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
@RequestMapping("/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public Result<PageResult<ExamVO>> page(@Valid ExamQueryDTO query) {
        return Result.success(examService.page(query));
    }

    @GetMapping("/{id}")
    public Result<ExamVO> detail(@PathVariable Long id) {
        return Result.success(examService.detail(id));
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody ExamSaveDTO dto) {
        return Result.success(examService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ExamSaveDTO dto) {
        examService.update(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        examService.publish(id);
        return Result.success();
    }

    @PutMapping("/{id}/close")
    public Result<Void> close(@PathVariable Long id) {
        examService.close(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        examService.delete(id);
        return Result.success();
    }
}
