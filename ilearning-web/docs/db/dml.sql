-- 初始数据：角色与管理员账号
USE `ilearning`;

-- 角色：role_code 供代码与权限判断使用，role_name 供界面展示
INSERT INTO `role` (`id`, `role_code`, `role_name`)
VALUES
(1, 'ADMIN', '管理员'),
(2, 'USER', '考生');

-- 管理员账号：admin / admin123（BCrypt 加密存储，仅供开发联调，请勿用于生产）
INSERT INTO `user` (`id`, `username`, `nickname`, `password`, `status`)
VALUES
(1, 'admin', '系统管理员', '$2a$10$c9a7AwbYwuYIaeROgaJriOCV8Jg.TiicLfVKY12Qc2WCcLYJnyfJW', 1);

-- 管理员角色关联（user_role 以 user_id + role_id 为复合主键）
INSERT INTO `user_role` (`user_id`, `role_id`)
VALUES
(1, 1);

-- 默认题库：question.question_bank_id 为必填，初始化一个可用题库供联调
INSERT INTO `question_bank` (`id`, `title`, `description`, `sort`, `status`)
VALUES
(1, '默认题库', '系统初始化题库', 0, 1);