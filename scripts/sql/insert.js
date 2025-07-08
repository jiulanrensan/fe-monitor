 
import http from 'http';

// 注意：如果遇到权限错误，需要在ClickHouse中为fre_monitor_user用户授予INSERT权限
// 执行以下SQL命令（需要管理员权限）：
// GRANT INSERT(aid, sid, uid, log_time, report_time, retry_times, url, method, status_code, duration, queue_time, queue_start, queue_end, req_page, res_page, network, model) ON fre_monitor_db.api__duration TO fre_monitor_user;
import constant from './constant.js';
const { hostname, port, username, password, database, table, tableMap } = constant;


// 对密码进行encodeURIComponent编码
const encodedPassword = encodeURIComponent(password);

// 生成测试数据的函数
function generateTestData(count = 1) {
    const urls = [
        'https://example.com/api/info',
        'https://example.com/api/user', 
        'https://example.com/api/config',
        'https://example.com/api/login',
        'https://example.com/api/register',
        'https://example.com/api/logout',
        'https://example.com/api/profile',
        'https://example.com/api/settings',
        'https://example.com/api/help',
        'https://example.com/api/about'
    ];
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const networks = ['WiFi', '4G', '5G', 'Ethernet'];
    const models = ['Model_X', 'Model_Y', 'Model_Z', 'Model_A'];
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
        // 生成当前时间戳（毫秒）
        const now = Date.now();
        
        // log_time 比 report_time 早 1-100 秒的随机值
        const timeDiff = Math.floor(Math.random() * 100000); // 1-100秒，转换为毫秒
        const logTimeMs = now - timeDiff;
        const reportTimeMs = now;
        
        // 转换为 ClickHouse DateTime64 格式
        const logTime = new Date(logTimeMs);
        const reportTime = new Date(reportTimeMs);
        
        const logTimeStr = logTime.toISOString().replace('T', ' ').replace('Z', '');
        const reportTimeStr = reportTime.toISOString().replace('T', ' ').replace('Z', '');
        
        // 随机选择 URL
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        const randomMethod = methods[Math.floor(Math.random() * methods.length)];
        const randomNetwork = networks[Math.floor(Math.random() * networks.length)];
        const randomModel = models[Math.floor(Math.random() * models.length)];
        
        // duration 为 200-1000 间的随机值
        const duration = Math.floor(Math.random() * 801) + 200; // 200-1000
        
        // 生成其他随机值
        const queueTime = Math.random() * 50; // 0-50ms
        const queueStart = logTimeMs;
        const queueEnd = logTimeMs + Math.floor(queueTime);
        
        const req_body_size = Math.floor(Math.random() * 1000);
        const res_body_size = Math.floor(Math.random() * 1000);
        const item = {
            aid: `app_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            sid: `session_${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            uid: `user_${Math.floor(Math.random() * 10000)}`,
            log_time: `toDateTime64('${logTimeStr}', 3, 'Asia/Shanghai')`,
            report_time: `toDateTime64('${reportTimeStr}', 3, 'Asia/Shanghai')`,
            retry_times: Math.floor(Math.random() * 3), // 0-2
            url: randomUrl,
            method: randomMethod,
            status_code: [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)],
            duration: duration,
            queue_time: queueTime,
            queue_start: queueStart,
            queue_end: queueEnd,
            req_page: `/${randomUrl.split('/').pop()}/page`,
            res_page: `/${randomUrl.split('/').pop()}/result`,
            network: randomNetwork,
            model: randomModel,
            // 体积大小
            req_body_size,
            res_body_size,
            error_code: [1000, 1001, 1002, 1003, 1004, 1005][Math.floor(Math.random() * 6)],
            error_reason: `error_reason_${Math.floor(Math.random() * 1000)}`,
        };
        
        data.push(item);
    }
    
    return data;
}

// 生成10条测试数据
const data = generateTestData(50);

const tableName = `${database}.${table}`;

const sqlFnMap = {
    [tableMap.api__duration]: (data, tableName) => {
        const sqlValues = data.map(item => `(
            '${item.pid}',
            '${item.aid}',
            '${item.sid}',
            '${item.uid}',
            ${item.log_time},
            ${item.report_time},
            ${item.retry_times},
            '${item.url}',
            '${item.method}',
            ${item.status_code},
            ${item.duration},
            ${item.queue_time},
            ${item.queue_start},
            ${item.queue_end},
            '${item.req_page}',
            '${item.res_page}',
            '${item.network}',
            '${item.model}'
        )`).join(', ');
        const insertSQL = `INSERT INTO ${tableName} (pid, aid, sid, uid, log_time, report_time, retry_times, url, method, status_code, duration, queue_time, queue_start, queue_end, req_page, res_page, network, model) VALUES ${sqlValues}`;
        return insertSQL;
    },
    [tableMap.api__error_business_code]: (data, tableName) => {
        const sqlValues = data.map(item => `(
            '${item.pid}',
            '${item.aid}',
            '${item.sid}',
            '${item.uid}',
            ${item.log_time},
            ${item.report_time},
            ${item.retry_times},
            '${item.url}',
            '${item.method}',
            ${item.status_code},
            ${item.error_code},
            '${item.error_reason}',
            '${item.model}'
        )`).join(', ');
        const insertSQL = `INSERT INTO ${tableName} (pid, aid, sid, uid, log_time, report_time, retry_times, url, method, status_code, error_code, error_reason, model) VALUES ${sqlValues}`;
        return insertSQL;
    },
    [tableMap.api__error_http_code]: (data, tableName) => {
        const sqlValues = data.map(item => `(
            '${item.pid}',
            '${item.aid}',
            '${item.sid}',
            '${item.uid}',
            ${item.log_time},
            ${item.report_time},
            ${item.retry_times},
            '${item.url}',
            '${item.method}',
            ${item.status_code},
            '${item.error_reason}',
            '${item.model}'
        )`).join(', ');
        const insertSQL = `INSERT INTO ${tableName} (pid, aid, sid, uid, log_time, report_time, retry_times, url, method, status_code, error_reason, model) VALUES ${sqlValues}`;
        return insertSQL;
    },
    [tableMap.api__body_size]: (data, tableName) => {
        const sqlValues = data.map(item => `(
            '${item.pid}',
            '${item.aid}',
            '${item.sid}',
            '${item.uid}',
            ${item.log_time},
            ${item.report_time},
            ${item.retry_times},
            '${item.url}',
            '${item.method}',
            ${item.status_code},
            ${item.req_body_size},
            ${item.res_body_size}
            '${item.model}'
        )`).join(', ');
        const insertSQL = `INSERT INTO ${tableName} (pid, aid, sid, uid, log_time, report_time, retry_times, url, method, status_code, req_body_size, res_body_size, model) VALUES ${sqlValues}`;
        return insertSQL;
    }
}

const insertSQL = sqlFnMap[table](data, tableName);

// 正确的URL构建方式 - SQL插入语句应该作为query参数
const path = `/query?user=${username}&password=${encodedPassword}&query=${encodeURIComponent(insertSQL)}`;
// console.log('请求路径:', path);

// 设置请求选项
const options = {
    hostname: hostname,
    port: port,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = http.request(options, (res) => {
    let chunks = [];
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });
    res.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString();
        console.log('原始响应:', responseBody);
        
        // 检查HTTP状态码
        console.log('HTTP状态码:', res.statusCode);
        
        // 检查响应头
        console.log('响应头:', JSON.stringify(res.headers));
        
        if (res.statusCode !== 200) {
            console.error(`HTTP错误: ${res.statusCode} - ${responseBody}`);
            return;
        }
        
        // 检查是否包含错误信息
        if (responseBody.includes('Code:') && responseBody.includes('DB::Exception:')) {
            console.error('ClickHouse数据库错误:', responseBody);
            return;
        }
        
        // 检查响应是否为空
        if (!responseBody.trim()) {
            console.log('插入成功！响应为空（这是正常的，INSERT操作通常不返回数据）');
            return;
        }
        
        try {
            // 尝试解析JSON
            const jsonResult = JSON.parse(responseBody);
            console.log('插入结果:', jsonResult);
        } catch (error) {
            console.error('JSON解析失败:', error.message);
            console.log('响应内容:', responseBody);
            
            // 如果响应不是JSON格式，直接输出内容
            if (responseBody.trim()) {
                console.log('非JSON响应内容:', responseBody);
            }
        }
    });
});

req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
});

req.end();