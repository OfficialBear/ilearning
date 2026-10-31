package com.saas.ilearning.common.constant;

/**
 * 考试记录状态常量，对应 {@code exam_attempt.status}。
 */
public final class AttemptStatusConstant {

    private AttemptStatusConstant() {
    }

    /**
     * 进行中：允许继续作答与保存答案。
     */
    public static final Integer IN_PROGRESS = 1;

    /**
     * 已交卷：存在需要人工评分的题目。
     */
    public static final Integer SUBMITTED = 2;

    /**
     * 已判分：全部题目完成评分。
     */
    public static final Integer GRADED = 3;

    /**
     * 已取消：不计入参加次数，也不展示成绩。
     */
    public static final Integer CANCELLED = 4;
}
