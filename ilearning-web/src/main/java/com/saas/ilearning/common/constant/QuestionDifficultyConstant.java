package com.saas.ilearning.common.constant;

public final class QuestionDifficultyConstant {

    private QuestionDifficultyConstant() {
    }

    public static final int EASY = 1;
    public static final int MEDIUM = 2;
    public static final int HARD = 3;

    public static boolean isValid(Integer difficulty) {
        return difficulty != null && difficulty >= EASY && difficulty <= HARD;
    }
}
