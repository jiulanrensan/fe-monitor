export default {
    hostname: 'localhost',
    port: 8123,
    username: 'fre_monitor_user',
    password: 'Password123!',
    database: 'fre_monitor_db',
    // 'api__duration',
    // 'api__error_business_code',
    // 'api__error_http_code',
    // 'api__body_size',
    table: 'api__duration', // 改这个
    tableMap: {
        api__duration: 'api__duration',
        api__error_business_code: 'api__error_business_code',
        api__error_http_code: 'api__error_http_code',
        api__body_size: 'api__body_size',
    }
}