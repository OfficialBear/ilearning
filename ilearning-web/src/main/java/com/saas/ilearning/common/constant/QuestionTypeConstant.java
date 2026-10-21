package com.saas.ilearning.common.constant;

public final class QuestionTypeConstant {

    private QuestionTypeConstant() {
    }

    public static final int SINGLE = 1;
    public static final int MULTIPLE = 2;
    public static final int JUDGE = 3;
    public static final int SAQ = 4;

    public static boolean isValid(Integer type) {
        return type != null && type >= SINGLE && type <= SAQ;
    }
}
