# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录为根目录
WORKDIR /app

# 复制根目录的依赖文件
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY packages/server/tsconfig.json ./
COPY packages/server/nest-cli.json ./
COPY packages/server/tsconfig.build.json ./

# 安装依赖（使用锁文件确保版本一致）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

# 构建写服务
RUN pnpm run build:write-server

# 生产阶段
FROM node:20-alpine AS production

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/dist/micro-service-write/src ./dist
# 复制共享模块到正确位置（相对于dist目录的上级目录）
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/dist/shared ./shared
# 复制依赖文件
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./

# 创建生产环境的package.json（移除type: module）
RUN sed '/"type": "module",/d' package.json > package.prod.json && mv package.prod.json package.json

# 安装生产依赖（跳过脚本执行）
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile --ignore-scripts

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 使用 dumb-init 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
