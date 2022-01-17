module.exports = {
    secret: require('crypto').randomBytes(64).toString('hex'),
    jwtExpiration: 3600,           // 1 hour
    jwtRefreshExpiration: 86400,   // 24 hours
}