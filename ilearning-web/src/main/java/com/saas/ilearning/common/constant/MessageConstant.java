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

    public static final String EXAM_NOT_FOUND = "考试不存在，请刷新后重试";
    public static final String EXAM_EDIT_FORBIDDEN = "只有草稿状态的考试可以编辑";
    public static final String EXAM_DELETE_FORBIDDEN = "只有草稿状态的考试可以删除";
    public static final String EXAM_STATUS_INVALID = "考试状态不合法";
    public static final String EXAM_STATUS_TRANSITION_INVALID = "考试状态流转不合法";
    public static final String EXAM_PAPER_NOT_AVAILABLE = "考试关联的试卷未发布或已归档，请重新选择试卷";
    public static final String EXAM_PASSING_SCORE_INVALID = "及格分数不能超过试卷总分";
    public static final String EXAM_TIME_RANGE_INVALID = "结束时间必须晚于开始时间";
    public static final String EXAM_IN_USE = "考试已有用户记录，无法删除";

    public static final String EXAM_NOT_AVAILABLE = "考试未发布或已关闭";
    public static final String EXAM_NOT_OPEN = "考试尚未开始";
    public static final String EXAM_ENDED = "考试已结束";
    public static final String EXAM_ATTEMPTS_EXHAUSTED = "已达到该考试的最大参加次数";
    public static final String ATTEMPT_NOT_FOUND = "考试记录不存在，请刷新后重试";
    public static final String ATTEMPT_NOT_IN_PROGRESS = "该次考试已交卷，无法继续作答";
    public static final String ATTEMPT_EXPIRED = "考试时间已到，系统已自动交卷，请查看考试记录";
    public static final String ATTEMPT_AUTO_SUBMITTED = "上次考试已超时并自动交卷，请查看考试记录";
    public static final String ATTEMPT_NOT_SUBMITTED = "考试尚未交卷，暂无成绩";
    public static final String ANSWER_QUESTION_INVALID = "题目不属于当前试卷";
    public static final String ANSWER_OPTION_INVALID = "答案选项不合法";
    public static final String ANSWER_TEXT_INVALID = "答案内容不合法";
    public static final String ANSWER_SAVE_FAILED = "保存答案失败，请稍后重试";
    public static final String PAPER_CONTENT_INVALID = "试卷内容异常，请联系管理员";
}
