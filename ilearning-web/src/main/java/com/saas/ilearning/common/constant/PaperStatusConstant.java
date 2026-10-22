package com.saas.ilearning.common.constant;

/**
 * 试卷状态常量。
 */
public final class PaperStatusConstant {

    private PaperStatusConstant() {
    }

    /**
     * 草稿：允许编辑题目、分值、题序和基本信息。
     */
    public static final Integer DRAFT = 0;

    /**
     * 已发布：题目集合与分值冻结，题目内容以快照为准。
     */
    public static final Integer PUBLISHED = 1;

    /**
     * 已归档：不再用于新的考试活动，仅保留历史查看。
     */
    public static final Integer ARCHIVED = 2;

    public static boolean isValid(Integer status) {
        return status != null && status >= DRAFT && status <= ARCHIVED;
    }
}
