module.exports = {
    PORT: process.env.PORT || 8080,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'heroku config:set CLIENT_ORIGIN=https://zhip.netlify.com',
    DATABASE_URL:
        process.env.DATABASE_URL || 'heroku config:set DATABASE_URL=mongodb://guest:guest123@ds235418.mlab.com:35418/zhip',
    TEST_DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        'mongodb://localhost/backend-test'
};

