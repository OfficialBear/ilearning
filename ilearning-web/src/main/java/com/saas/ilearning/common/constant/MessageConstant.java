package com.saas.ilearning.common.constant;

/**
 * 统一提示信息常量。
 */
public final class MessageConstant {

    private MessageConstant() {
    }

    public static final String USERNAME_OR_PASSWORD_ERROR = "用户名或密码错误";
    public static final String ACCOUNT_DISABLED = "账号已被禁用";
    public static final String LOGIN_STATE_INVALID = "登录状态失效，请重新登录";
    public static final String UNAUTHENTICATED = "未登录或登录已过期";
    public static final String FORBIDDEN = "没有访问权限";
    public static final String UNKNOWN_ERROR = "未知错误";

    public static final String USERNAME_EXISTS = "用户名已存在，请更换用户名";

    public static final String QUESTION_NOT_FOUND = "试题不存在";
    public static final String QUESTION_TYPE_INVALID = "题目类型不合法";
    public static final String QUESTION_DIFFICULTY_INVALID = "题目难度不合法";
    public static final String QUESTION_CONTENT_REQUIRED = "题干不能为空";
    public static final String QUESTION_OPTION_COUNT_INVALID = "题目选项数量不符合题型要求";
    public static final String QUESTION_CORRECT_COUNT_INVALID = "正确选项数量不符合题型要求";
    public static final String QUESTION_OPTION_CONTENT_REQUIRED = "选项内容不能为空";
    public static final String JUDGE_OPTION_INVALID = "判断题必须且只能有两个选项";
    public static final String SAQ_OPTION_NOT_ALLOWED = "简答题不能设置选项";
    public static final String QUESTION_IN_USE = "试题已被试卷引用，无法删除";
    public static final String QUESTION_IN_USE_EDIT_FORBIDDEN = "试题已被试卷引用，题干、选项和正确答案不可修改，请使用复制功能创建新题";
    public static final String QUESTION_BANK_NOT_FOUND = "题库不存在，请刷新后重试";
    public static final String QUESTION_BANK_DISABLED = "题库已停用，无法使用";
    public static final String QUESTION_BANK_STATUS_INVALID = "题库状态不合法";
    public static final String QUESTION_BANK_HAS_QUESTIONS = "题库下仍有试题，无法删除，请先移除或转移试题";

    public static final String PAPER_NOT_FOUND = "试卷不存在，请刷新后重试";
    public static final String PAPER_EDIT_FORBIDDEN = "只有草稿状态的试卷可以编辑";
    public static final String PAPER_DELETE_FORBIDDEN = "只有草稿状态的试卷可以删除";
    public static final String PAPER_QUESTIONS_REQUIRED = "试卷至少需要一道题目才能发布";
    public static final String PAPER_QUESTION_NOT_FOUND = "试卷中包含不存在的题目，请刷新后重试";
    public static final String PAPER_QUESTION_DISABLED = "试卷中包含已停用的题目，请先启用或更换题目";
    public static final String PAPER_QUESTION_DUPLICATE = "同一道题目不能重复加入试卷";
    public static final String PAPER_STATUS_INVALID = "试卷状态不合法";
    public static final String PAPER_STATUS_TRANSITION_INVALID = "试卷状态流转不合法";
    public static final String PAPER_IN_USE = "试卷已被考试活动引用，无法删除";
    public static final String PAPER_SNAPSHOT_FAILED = "生成试卷快照失败，请稍后重试";
}
