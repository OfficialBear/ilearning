package com.saas.ilearning.controller;

import com.saas.ilearning.common.result.PageResult;
import com.saas.ilearning.common.result.Result;
import com.saas.ilearning.dto.PaperQueryDTO;
import com.saas.ilearning.dto.PaperSaveDTO;
import com.saas.ilearning.service.PaperService;
import com.saas.ilearning.vo.PaperDetailVO;
import com.saas.ilearning.vo.PaperListItemVO;
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
@RequestMapping("/papers")
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public Result<PageResult<PaperListItemVO>> page(@Valid PaperQueryDTO query) {
        return Result.success(paperService.page(query));
    }

    @GetMapping("/{id}")
    public Result<PaperDetailVO> detail(@PathVariable Long id) {
        return Result.success(paperService.detail(id));
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody PaperSaveDTO dto) {
        return Result.success(paperService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody PaperSaveDTO dto) {
        paperService.update(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        paperService.publish(id);
        return Result.success();
    }

    @PutMapping("/{id}/archive")
    public Result<Void> archive(@PathVariable Long id) {
        paperService.archive(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        paperService.delete(id);
        return Result.success();
    }
}
