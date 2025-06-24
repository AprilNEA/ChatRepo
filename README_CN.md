# Chat Repository API

这是一个用于导入和处理 GitHub trending 仓库的 API 服务。

## 功能特性

- **自动定时导入**: 通过 BullMQ 每日自动导入 GitHub trending 仓库
- **LLM 文本转换**: 将仓库信息转换为 LLM 可读的格式
- **REST API**: 提供查询和管理仓库的 API 接口

## 环境配置

创建 `.env` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/chatrepo

# Redis 连接（用于 BullMQ）
REDIS_URL=redis://localhost:6379

# GitHub API Token（可选 - 用于提高速率限制）
GITHUB_TOKEN=your_github_token_here

# 服务器配置
PORT=3001
NODE_ENV=development
```

## 安装和运行

```bash
# 安装依赖
pnpm install

# 数据库迁移
pnpm run db:migrate

# 启动开发服务器
pnpm run dev

# 生产环境构建
pnpm run build
pnpm run start
```

## API 接口

### 获取所有仓库
```
GET /api/repo
```

### 获取仓库及其上下文
```
GET /api/repo/with-context
```

### 手动触发 trending 导入
```
POST /api/repo/trigger-import
```

## 队列系统

项目使用 BullMQ 实现定时任务：

1. **Trend Tracker**: 每日定时获取 GitHub trending 仓库
2. **Converter**: 将仓库信息转换为 LLM 可读文本

### 定时规则

- **每日导入**: 每天凌晨执行 trending 仓库导入
- **智能过滤**: 只导入有描述且 stars > 5 的仓库
- **批量处理**: 支持批量转换和存储

## 数据库结构

### repo 表
存储仓库基本信息：
- 名称、所有者、描述
- 星标数、语言、URL
- 创建和更新时间

### repo_context 表
存储 LLM 转换后的文本：
- 仓库 ID 关联
- 格式类型（text/llm-readable）
- 转换后的内容
- 作业 ID 跟踪

## LLM 文本格式

转换后的文本包含：
- 仓库基本信息
- 编程语言分布
- 项目结构分析
- README 内容（截断）
- 智能分析总结

## 开发说明

- 使用 Hono.js 作为 Web 框架
- Drizzle ORM 进行数据库操作
- BullMQ 处理队列任务
- TypeScript 类型安全 