# 开发环境 Dockerfile
FROM node:18-alpine

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
RUN pnpm run build:write

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pnpm", "run", "start:write:prod"]
