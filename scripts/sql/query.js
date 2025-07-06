/* eslint-disable */
const http = require('http');

const hostname = 'localhost';
const port = 8123;
const username = 'fre_monitor_user';
const password = 'Password123!';

// 对密码进行encodeURIComponent编码
const encodedPassword = encodeURIComponent(password);

// 要查询的SQL语句
const querySQL = 'SELECT * FROM fre_monitor_db.api__duration FORMAT JSON';

// 正确的URL构建方式 - SQL查询应该作为query参数
const path = `/query?user=${username}&password=${encodedPassword}&query=${encodeURIComponent(querySQL)}`;
console.log('请求路径:', path);

// 设置请求选项
const options = {
    hostname: hostname,
    port: port,
    path: path,
    method: 'GET',
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
        
        try {
            // 尝试解析JSON
            const jsonResult = JSON.parse(responseBody);
            console.log('查询结果:', jsonResult);
        } catch (error) {
            console.error('JSON解析失败:', error.message);
            console.log('响应内容:', responseBody);
        }
    });
});

req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
});

req.end();