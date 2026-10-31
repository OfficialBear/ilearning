# 用户参加考试与作答设计

本文档记录用户端考试流程（`exam_attempt` / `exam_answer`）的设计决策与实现边界。数据库结构沿用
[`online-examination-database-design.md`](./db/online-examination-database-design.md)，本模块不修改 DDL。

## 1. 职责边界

- **考试管理**：管理员定义考试活动（引用试卷、开放时间、时长、次数、及格线）。
- **用户作答（本模块）**：用户查看可参加的考试、开始/继续一次考试、保存答案、交卷、查看成绩与历史记录。
- **人工评分**：简答题交卷后停留为“待人工评分”；评分操作属于后续管理端功能，本模块不实现。

试题内容来自试卷发布时固化的 `paper_question.question_snapshot`，因此题库后续修改不会影响已发布考试。
作答页面的响应**不包含**正确答案、解析与判题结果，交卷后才会在成绩单中返回。

## 2. 考试记录生命周期

```text
进行中(1) --交卷/超时--> 已交卷(2, 有待评分题) 或 已判分(3)
```

| 状态 | 含义 | 可保存答案 | 可查看成绩 |
|---|---|---|---|
| 1 | 进行中 | 是 | 否 |
| 2 | 已交卷，等待人工评分 | 否 | 是（部分题目待评分） |
| 3 | 已判分 | 否 | 是 |
| 4 | 已取消 | 否 | 否 |

规则：

1. 同一用户在同一考试中最多只有一条进行中记录；再次开始会返回该记录（继续作答）。
2. 参加次数按状态 1/2/3 统计；`max_attempts = 0` 表示不限次数。
3. 开始考试时锁定 `exam` 行，串行化并发开始请求，避免重复记录或突破次数上限。
4. 进行中记录的交卷/保存使用 `SELECT ... FOR UPDATE` 锁定记录，状态更新带预期状态条件。
5. 关闭考试不再允许新开始，但历史记录仍可查看；已进行中的记录按自身截止时间继续。

## 3. 时间与超时

- `duration_minutes > 0`：截止时间 = 开始时间 + 时长。
- 考试设置了 `end_time` 时，截止时间取两者中较早者，活动结束即停止作答。
- `duration_minutes = 0` 且未设置 `end_time`：不限时，`deadline = NULL`。
- 剩余时间以服务端返回的 `deadlineMillis` 与 `serverTimeMillis` 计算，避免客户端时钟偏差。
- 到达截止时间后：
  - 作答页面倒计时归零并自动交卷；
  - 服务端在访问记录、保存答案或交卷时校验超时，超时记录会被自动交卷；
  - 超时自动交卷的 `submitted_at` 记为截止时间，`time_spent_seconds` 按截止时间计算。

## 4. 答案格式与校验

`exam_answer.answer_content` 为 JSON：

```json
{ "optionKeys": ["A", "C"] }
{ "textAnswer": "简答题文本" }
```

- 单选题、判断题：恰好一个选项标识。
- 多选题：至少一个选项标识；判分采用**完全匹配**，不设部分得分。
- 简答题：文本最长 5000 字；不能提交选项。
- 选项标识必须存在于该题快照的选项中；清空答案会删除对应答题记录。
- 题目必须属于当前考试的试卷，否则拒绝保存。

## 5. 判分规则

- 单选、多选、判断：按快照中的正确选项集合与用户选项集合做全等比较，答对得该题满分，否则 0 分。
- 未作答的客观题记 0 分。
- 简答题：
  - 未作答：0 分；
  - 有作答：`is_correct` 与 `actual_score` 留空，记录进入“待人工评分”，整场记录状态为 2。
- 全部为客观题时交卷后直接判分：`user_score` 为各题得分之和，`is_passed = user_score >= passing_score`，状态为 3。
- 成绩单在交卷后返回正确答案、解析与逐题得分。

## 6. 接口契约

所有接口位于 `/user/**`，要求已登录；用户只能访问自己的考试记录。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/user/exams?page&pageSize&keyword` | 当前可参加的考试及本人参加情况 |
| POST | `/user/exams/{examId}/attempts` | 开始或继续一次考试，返回作答页面 |
| GET | `/user/attempts` | 我的考试记录（分页） |
| GET | `/user/attempts/{attemptId}` | 重新加载进行中考试的作答页面与已保存答案 |
| PUT | `/user/attempts/{attemptId}/answers` | 保存单题答案（自动保存） |
| POST | `/user/attempts/{attemptId}/submit` | 交卷并判分（幂等） |
| GET | `/user/attempts/{attemptId}/result` | 查看成绩单 |

开始考试响应示例（节选）：

```json
{
  "attemptId": 12,
  "examId": 4,
  "examTitle": "羽毛球规则月度考试",
  "attemptNo": 1,
  "deadlineMillis": 1793000000000,
  "serverTimeMillis": 1792996400000,
  "totalScore": 40,
  "passingScore": 24,
  "questions": [
    {
      "paperQuestionId": 31,
      "sort": 1,
      "score": 10,
      "questionType": 1,
      "content": "题干",
      "options": [{ "optionKey": "A", "content": "选项 A", "imageUrl": "" }],
      "selectedOptionKeys": [],
      "textAnswer": null
    }
  ]
}
```

保存答案请求：

```json
{
  "paperQuestionId": 31,
  "optionKeys": ["A"],
  "textAnswer": null
}
```

## 7. 前端结构

- `/exam-center`：两个视图——可参加的考试（卡片、关键词搜索、分页）与我的考试记录（桌面表格 / 移动端卡片）。
- `/exam-center/attempt/:attemptId`：作答页。左侧题目区，右侧倒计时、进度、题号面板与交卷按钮；
  移动端将题号面板收进抽屉。答案变更后 600ms 自动保存，显示保存状态；交卷前刷新未落库的答案。
- `/exam-center/result/:attemptId`：成绩单，展示总分、及格状态、逐题得分、正确答案与解析；
  有待评分简答题时提示等待人工评分。
- 路由对所有已登录用户开放；管理员仍通过 `/exams` 使用考试管理。

## 8. 暂未实现

- 管理端人工评分与成绩发布（待评分记录当前保持状态 2）。
- 取消进行中的考试（状态 4 暂未产生）。
- 防作弊（切屏、摄像头、题目乱序、选项乱序）。
- 逐题保存历史版本、离线答题与断线重传队列。
- 成绩申诉与重判。
