package com.saas.ilearning.common.constant;

/**
 * 考试活动状态常量。
 */
public final class ExamStatusConstant {

    private ExamStatusConstant() {
    }

    /**
     * 草稿：可编辑、可删除，考生不可见。
     */
    public static final Integer DRAFT = 0;

    /**
     * 已发布：按开放时间对考生开放，不可再修改规则。
     */
    public static final Integer PUBLISHED = 1;

    /**
     * 已关闭：不再允许新的考试，历史记录保留。
     */
    public static final Integer CLOSED = 2;

    public static boolean isValid(Integer status) {
        return status != null && status >= DRAFT && status <= CLOSED;
    }
}
