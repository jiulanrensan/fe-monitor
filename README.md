# fe-monitor

一个简单的前端监控系统

## 使用docker构建

```bash
# 构建服务
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 查看构建产物
docker run -it --rm --entrypoint /bin/sh fe-monitor-read-service:latest
```
