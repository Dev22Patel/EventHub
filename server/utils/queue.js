const Bull = require('bull');
const redis = require('./redis');
const sendMail = require('../controllers/emailController');

const mailQueue = new Bull('auction mail queue', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
    },
    settings: {
        stalledInterval: 30 * 1000,
        maxStalledCount: 1,
    }
});

mailQueue.process('send-auction-email', 5, async (job) => {
    const { to, subject, message, metadata } = job.data;
    try {
        console.log(`Processing email job ${job.id} for: ${to}`);
        await sendMail(to, subject, message);
        console.log(`Email sent successfully to: ${to} | Type: ${metadata?.type || 'unknown'}`);
        return { success: true, email: to, type: metadata?.type };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
});

mailQueue.on('completed', (job, result) => {
    console.log(`Email job ${job.id} completed for ${result.email}`);
});

mailQueue.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
});

const queueEmail = (to, subject, message, options = {}) => {
    setImmediate(async () => {
        try {
            const job = await mailQueue.add('send-auction-email', {
                to,
                subject,
                message,
                metadata: options.metadata || {}
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                delay: options.delay || 0,
                priority: options.priority || 0,
                ...options
            });
            console.log(`Email queued for ${to}, Job ID: ${job.id}, Type: ${options.metadata?.type || 'unknown'}`);
        } catch (error) {
            console.error('Error adding email to queue:', error);
        }
    });
};

process.on('SIGTERM', async () => {
    console.log('Shutting down mail queue...');
    await mailQueue.close();
    await redis.disconnect();
});

module.exports = { mailQueue, queueEmail };
