# 试卷管理设计与实现

本文档记录试卷管理模块（`paper` / `paper_question`）的设计决策与实现边界。数据库结构沿用
[`online-examination-database-design.md`](./db/online-examination-database-design.md)，本模块不修改 DDL。

## 1. 职责边界

- **试卷（paper）**：固定"考什么"——题目集合、题序、每题分值和试卷总分。
- **考试（exam）**：定义"怎么考"——开放时间、时长、次数、及格线；不属于本模块。
- 试卷中的题目引用题库中的源题目（`paper_question.question_id`），同一道题可在不同试卷中拥有不同分值与顺序。

## 2. 生命周期

```text
草稿(0) --发布--> 已发布(1) --归档--> 已归档(2)
```

| 状态 | 编辑 | 删除 | 组卷 | 可被考试引用 |
|---|---|---|---|---|
| 草稿 0 | 允许 | 允许 | 允许 | 否 |
| 已发布 1 | 禁止 | 禁止 | 冻结 | 是 |
| 已归档 2 | 禁止 | 禁止 | 冻结 | 否（仅保留历史） |

规则：

1. 新建试卷一律为草稿，可保存 0 道题的空草稿。
2. 发布要求：至少 1 道题；每题分值 > 0；引用题目与所属题库均处于启用状态。
3. 发布时按当前题目内容重新生成快照，并冻结题目集合、题序与分值。
4. 删除仅限草稿，且需确认没有考试活动引用（防御性校验）。
5. 状态流转使用 `UPDATE ... WHERE id=? AND status=<预期状态>`，并发下只有一个请求能成功。

## 3. 题目快照

`paper_question.question_snapshot` 为 `JSON NOT NULL`，因此**草稿保存时也会写入当前内容快照**，
发布时再重新生成一次。读取规则：

- 草稿：返回实时题目内容（`snapshot=false`），便于编辑时看到最新题干与选项。
- 已发布/已归档：优先解析快照（`snapshot=true`）；解析失败时回退实时内容并记录告警。

快照结构（版本 1）：

```json
{
  "version": 1,
  "questionType": 1,
  "difficulty": 1,
  "content": "题干",
  "imageUrl": "",
  "analysis": "解析",
  "options": [
    { "optionKey": "A", "content": "选项内容", "imageUrl": "", "isCorrect": 1 }
  ]
}
```

`version` 用于后续结构兼容；`question_snapshot` 是考试作答与历史复核的内容依据。

## 4. 接口契约

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/papers?page&pageSize&keyword&status` | 分页列表，返回题目数量与总分 |
| GET | `/papers/{id}` | 详情（含题目；已发布/已归档读取快照） |
| POST | `/papers` | 新建草稿，返回试卷 id |
| PUT | `/papers/{id}` | 保存草稿（全量替换题目、题序、分值） |
| PUT | `/papers/{id}/publish` | 草稿 → 已发布，生成快照 |
| PUT | `/papers/{id}/archive` | 已发布 → 已归档 |
| DELETE | `/papers/{id}` | 删除草稿 |

请求体：

```json
{
  "title": "羽毛球规则月度考试",
  "description": "说明",
  "questions": [
    { "questionId": 1, "score": 10 },
    { "questionId": 2, "score": 15.5 }
  ]
}
```

`sort` 由服务端按数组顺序生成（从 1 开始），客户端不传；总分由每题分值求和得到。
所有接口仅 `ADMIN` 可访问（`SecurityConfig`）。

## 5. 一致性与校验

- 事务边界：保存、发布、归档、删除均为单事务；保存时先替换 `paper_question`，再更新元数据。
- 唯一约束：`uk_sort(paper_id, sort)` 与 `uk_question(paper_id, question_id)` 由服务端生成的数据天然满足；
  服务端仍显式拒绝重复题目。
- 分页：`page >= 1`，`pageSize <= 100`；关键词匹配标题/描述。
- 分值：`0.01 ~ 1000.00`，最多 2 位小数；总分实时重算，不信任客户端。
- 并发：发布/归档的状态更新带预期状态条件；删除仅针对草稿。

## 6. 前端结构

- `/papers`：试卷列表（关键词/状态筛选、分页、桌面表格 + 移动端卡片）。
- `PaperEditorDrawer`：基本信息 + 已选题目（分值、上移/下移、移除）+ 保存草稿。
- `QuestionPickerDrawer`：按题干/题型/难度/题库筛选，支持跨页多选，已加入试卷的题目禁选。
- `PaperDetailDrawer`：试卷预览，展示题型、难度、分值、选项、正确答案、解析与快照标记。

## 7. 暂未实现

- 试卷复制/版本化（当前通过"新建试卷"实现等价流程）。
- 考试活动与试卷发布的联动校验（考试模块尚未实现）。
- 发布后重新编辑（按设计冻结，需要调整时新建试卷）。
