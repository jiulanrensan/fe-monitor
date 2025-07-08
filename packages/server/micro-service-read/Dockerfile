# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制根目录的依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY packages/server/tsconfig.json ./
COPY packages/server/nest-cli.json ./

# 安装依赖（使用锁文件确保版本一致）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY packages/server ./

# 构建项目
RUN pnpm run build:read-server

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/micro-service-read/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/micro-service-read/package.json ./

# 只安装生产依赖
RUN npm install --only=production && npm cache clean --force

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 使用 dumb-init 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
