# Juya Review Bot

Juya Review Bot 是一个自托管的 GitHub App 服务。它接收 Pull Request 评论 webhook，校验请求与权限，调用 OpenCodeReview engine 完成代码审查，再通过 GitHub API 发布汇总和行内评论。默认触发命令是 `/juya review`。

## 架构边界

本仓库只维护 GitHub App bot、Juya Console、部署清单和镜像构建：

```text
GitHub issue_comment webhook
              |
              v
       Juya Review Bot
       |      |      |
       |      |      +-- Juya Console /admin/
       |      +--------- GitHub API comments
       +---------------- ocr command
                              |
                              v
                    OpenCodeReview engine
```

OpenCodeReview engine 来自 npm 包 `@alibaba-group/open-code-review`，不会复制、vendor、submodule 或在本仓库编译其源码。产品身份、GitHub 评论、服务名称和后台名称均属于 Juya；`OCR_*` 变量和 `ocr` 命令只表示底层 engine。

## Webhook 流程

1. 用户在 Pull Request 下评论 `/juya review`。
2. GitHub 发送 `issue_comment.created` 到 `POST /github/webhook`。
3. 服务使用 `GITHUB_WEBHOOK_SECRET` 校验 `X-Hub-Signature-256`。
4. 服务检查用户、用户 ID、仓库所有者和公开仓库限制。
5. 任务进入单进程队列，并在临时工作目录准备 PR 的 base/head。
6. 服务执行 `ocr review --from <base_sha> --to <head_sha> --format json`。
7. Juya Review Bot 发布汇总与可定位的行内评论。
8. 任务结束后清理临时工作目录，并将受限的管理数据写入 `ADMIN_DATA_DIR`。

触发短语按 trim 后的小写文本精确匹配；不接受命令前缀或附加参数。可用逗号配置多个短语，但默认只使用 `/juya review`。

## GitHub App

创建 GitHub App，并配置以下权限：

```text
Metadata: Read-only
Contents: Read-only
Issues: Read and write
Pull requests: Read and write
```

Webhook URL 使用 `https://<your-domain>/github/webhook`，启用 `Issue comment` 事件，并只把 App 安装到允许 Juya 审查的仓库或账号。

## 环境变量

复制示例配置：

```bash
cp deploy/.env.example deploy/.env
```

核心必填项：

```env
BOT_TRIGGER_PHRASES=/juya review
ALLOWED_USERS=your-login,friend-login
ALLOWED_USER_IDS=
ALLOWED_REPO_OWNERS=your-login,friend-login
BOT_REPO_ROOT=/data/repos

GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=/config/github-app-private-key.pem
GITHUB_WEBHOOK_SECRET=replace-with-random-hex

OCR_LLM_URL=https://api.example.com
OCR_LLM_TOKEN=replace-with-provider-token
OCR_LLM_MODEL=your-model
```

常用运行参数：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `3007` | HTTP 监听端口 |
| `MAX_REVIEW_COMMENTS` | `30` | 单任务最多发布的审查评论 |
| `JOB_TIMEOUT_MS` | `1200000` | 单任务总超时 |
| `CLEANUP_WORKDIR` | `true` | 任务结束后清理临时目录 |
| `WEBHOOK_BODY_LIMIT_BYTES` | `1048576` | webhook body 上限 |
| `OCR_CONCURRENCY` | `1` | OpenCodeReview engine 文件并发 |
| `OCR_MAX_GIT_PROCS` | `2` | OpenCodeReview engine git 子进程并发 |
| `OCR_PER_FILE_TIMEOUT_MINUTES` | `10` | OpenCodeReview engine 单文件超时 |
| `LLM_PROXY_USER_AGENT` | `juya-review-bot/0.1.0` | 内置 LLM 代理的 User-Agent |

OpenAI 兼容端点通常设置 `OCR_USE_ANTHROPIC=false`；Anthropic 兼容端点通常设置 `OCR_USE_ANTHROPIC=true` 和 `OCR_LLM_AUTH_HEADER=x-api-key`。

内置 LLM 代理只用于容器内私有流量。启用时配置 `LLM_PROXY_TARGET_URL`、`LLM_PROXY_INTERNAL_TOKEN`、`LLM_PROXY_UPSTREAM_AUTH_HEADER` 和 `LLM_PROXY_UPSTREAM_TOKEN`；不要把 `/llm/*` 暴露到公网。

## 本地测试与镜像构建

需要 Node.js 20 或更高版本：

```bash
npm ci
npm test
find src test -name '*.js' -print0 | xargs -0 -n1 node --check
```

完整构建和 engine 验证：

```bash
docker build --pull --no-cache -t juya-review-bot:dev .
docker run --rm --entrypoint ocr juya-review-bot:dev --version
docker run --rm --entrypoint ocr juya-review-bot:dev review --help
```

`review --help` 必须继续提供 `--from`、`--to`、`--format`、`--concurrency`、`--max-git-procs` 和 `--timeout`。

## VPS 部署

准备运行目录：

```bash
cd deploy
cp .env.example .env
mkdir -p data/repos data/admin
chmod 600 .env
sudo chown -R 10001:10001 data
```

将 GitHub App 私钥保存为 `deploy/github-app-private-key.pem` 并执行 `chmod 600 github-app-private-key.pem`。启动或升级：

```bash
docker compose pull
docker compose up -d
```

Compose 使用 `ghcr.io/makomakogo/juya-review-bot:latest`、非 root UID/GID `10001:10001`、只读私钥挂载、持久化 `data/`，并只在 `127.0.0.1:3007` 暴露服务。

健康检查：

```bash
curl http://127.0.0.1:3007/health
```

```json
{"ok":true,"service":"juya-review-bot"}
```

## Juya Console

将 `ADMIN_PASSWORD` 设置为至少 16 个字符后，可在 `/admin/` 使用 Juya Console：

```env
ADMIN_PASSWORD=replace-with-long-admin-password
ADMIN_DATA_DIR=/data/admin
ADMIN_ALLOWED_HOSTS=review.example.com
ADMIN_SESSION_TTL_HOURS=12
ADMIN_COOKIE_SECURE=true
ADMIN_TRUST_PROXY=true
```

后台保存任务历史、受限日志、统计、配置审计和 session 状态。`ADMIN_DATA_DIR` 必须允许 UID/GID `10001` 写入。后台可编辑允许热更新的配置，但不能编辑 `ADMIN_PASSWORD` 和 `ADMIN_DATA_DIR`。

管理路由包括：

```text
GET  /admin/
GET  /admin/assets/juya.jpg
GET  /admin/*
POST /admin/*
```

## 安全边界

- webhook 必须通过 HMAC-SHA256 签名校验。
- 触发者和仓库所有者必须在 allowlist 中，私有仓库不会进入审查流程。
- GitHub App 私钥只读挂载，不进入镜像或 Git。
- 管理后台使用 Host allowlist、同源检查、CSRF、`HttpOnly`/`SameSite=Strict` cookie 和严格 CSP。
- Juya 图标只有固定的 `GET /admin/assets/juya.jpg` 路由；服务不会开放通用静态目录。
- 日志不保存 webhook payload、OCR stdout、原始供应商响应或密钥；敏感字段会被脱敏。
- 公网反向代理只应暴露 `/health`、`/github/webhook` 和明确启用的 `/admin/*`，不得暴露 `/llm/*`。

## OpenCodeReview `@latest` 策略

镜像构建时执行 `npm install -g @alibaba-group/open-code-review@latest`。CI 每日使用 `--pull --no-cache` 重新解析 npm 当前的 `@latest`，并以 `latest` 和 `ocr-<实际版本>` 发布镜像。镜像运行时设置 `OCR_NO_UPDATE=1`，因此 OpenCodeReview engine 不会在容器启动或执行审查时自行更新。

这个策略有意不 pin OpenCodeReview engine 版本：同一 Git commit 在不同日期构建可能解析到不同版本，所以构建不保证可复现。实际 engine 版本由镜像标签、构建日志和 GitHub Actions job summary 记录。

## 许可证

本仓库使用 [Apache License 2.0](LICENSE)。Powered by OpenCodeReview；底层 npm 包及其归属、许可证和商标由 OpenCodeReview 项目维护，本仓库的产品身份为 Juya Review Bot。
