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
    // 'fre_log',
    table: 'fre_log',
    // tableList: ['api__duration', 'api__error_business_code', 'api__error_http_code', 'api__body_size', 'fre_log'],
    tableList: ['api__error_business_code', 'api__error_http_code'],
    tableMap: {
        api__duration: 'api__duration',
        api__error_business_code: 'api__error_business_code',
        api__error_http_code: 'api__error_http_code',
        api__body_size: 'api__body_size',
        fre_log: 'fre_log',
    }
}