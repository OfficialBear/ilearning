package com.saas.ilearning.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

@Data
public class AttemptHistoryQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Min(value = 1, message = "页码不能小于 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页数量不能小于 1")
    @Max(value = 100, message = "每页数量不能超过 100")
    private Integer pageSize = 10;

    public long getOffset() {
        int currentPage = page == null || page < 1 ? 1 : page;
        int currentPageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        return (long) (currentPage - 1) * currentPageSize;
    }
}
