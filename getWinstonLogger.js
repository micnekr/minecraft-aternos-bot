const winston = require("winston");

// create a logger
module.exports = function () {
    return winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
            //
            // - Write all logs with level `error` and below to `error.log`
            // - Write all logs with level `info` and below to `combined.log`
            //
            new winston.transports.Console(),
            new winston.transports.File({ filename: './logs/error.log', level: 'error', handleExceptions: true }),
            new winston.transports.File({ filename: './logs/combined.log' }),
        ],
    });
}