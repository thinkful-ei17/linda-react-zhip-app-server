module.exports = {
    PORT: process.env.PORT || 8080,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    DATABASE_URL:
        process.env.DATABASE_URL || 'mongodb://guest:guest123@ds235418.mlab.com:35418/zhip',
    TEST_DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        'mongodb://localhost/backend-test'
};

