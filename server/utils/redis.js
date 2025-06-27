const Redis = require('ioredis');

const redis = new Redis({
    host:  'localhost',
    port:  6379,
    password:  'your_redis_password',
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    keepAlive: 30000,
    maxLoadingTimeout: 5000,
});

module.exports = redis;
