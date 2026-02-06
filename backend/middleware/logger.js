const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const constants = require('../config/constants');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

morgan.token('user-id', (req) => {
    return req.user ? req.user.id : 'anonymous';
});

morgan.token('response-time-ms', (req, res) => {
    return `${res.get('X-Response-Time')}ms`;
});

const devFormat = ':method :url :status :response-time-ms - :user-id';

const prodFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
);

const combinedLogStream = fs.createWriteStream(
    path.join(logsDir, 'combined.log'),
    { flags: 'a' }
);

const errorStream = {
    write: (message) => {
        errorLogStream.write(message);
        if (process.env.NODE_ENV === 'development') {
            console.error(message.trim());
        }
    }
};

const skipLogging = (req, res) => {
    return req.url === '/api/health' || 
           req.url.startsWith('/assets/') ||
           req.url === '/favicon.ico';
};

const accessLogger = morgan(process.env.NODE_ENV === 'production' ? prodFormat : devFormat, {
    stream: accessLogStream,
    skip: skipLogging
});

const errorLogger = morgan(prodFormat, {
    stream: errorStream,
    skip: (req, res) => res.statusCode < 400 || skipLogging(req, res)
});

const combinedLogger = morgan('combined', {
    stream: combinedLogStream,
    skip: skipLogging
});

const appLogger = {
    info: (message, data = {}) => {
        const logEntry = createLogEntry('INFO', message, data);
        writeToFile('app.log', logEntry);
        if (process.env.NODE_ENV === 'development') {
            console.log(logEntry);
        }
    },
    
    warn: (message, data = {}) => {
        const logEntry = createLogEntry('WARN', message, data);
        writeToFile('app.log', logEntry);
        console.warn(logEntry);
    },
    
    error: (message, error = null, data = {}) => {
        const logEntry = createLogEntry('ERROR', message, { 
            ...data, 
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null
        });
        writeToFile('app.log', logEntry);
        writeToFile('error.log', logEntry);
        console.error(logEntry);
    },
    
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const logEntry = createLogEntry('DEBUG', message, data);
            console.debug(logEntry);
        }
    }
};

function createLogEntry(level, message, data) {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        level,
        message,
        ...data
    };
    
    return JSON.stringify(entry);
}

function writeToFile(filename, entry) {
    const fileStream = fs.createWriteStream(
        path.join(logsDir, filename),
        { flags: 'a' }
    );
    
    fileStream.write(entry + '\n');
    fileStream.end();
}

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        res.setHeader('X-Response-Time', duration);
        
        if (duration > 1000) { 
            appLogger.warn('Slow request detected', {
                method: req.method,
                url: req.url,
                duration: `${duration}ms`,
                user: req.user ? req.user.id : 'anonymous'
            });
        }
    });
    
    next();
};

const securityLogger = {
    loginAttempt: (email, success, ip, userAgent) => {
        appLogger.info('Login attempt', {
            email,
            success,
            ip,
            userAgent: userAgent.substring(0, 100) 
        });
    },
    
    registration: (email, ip, userAgent) => {
        appLogger.info('User registration', {
            email,
            ip,
            userAgent: userAgent.substring(0, 100)
        });
    },
    
    passwordChange: (userId, ip) => {
        appLogger.info('Password change', {
            userId,
            ip
        });
    },
    
    suspiciousActivity: (event, data) => {
        appLogger.warn('Suspicious activity', {
            event,
            ...data
        });
    }
};

const dbLogger = {
    query: (query, params, duration) => {
        if (process.env.NODE_ENV === 'development') {
            appLogger.debug('Database query', {
                query: query.substring(0, 200), 
                params,
                duration: `${duration}ms`
            });
        }
        
        if (duration > 100) { 
            appLogger.warn('Slow database query', {
                query: query.substring(0, 200),
                duration: `${duration}ms`
            });
        }
    },
    
    error: (error, query, params) => {
        appLogger.error('Database error', error, {
            query: query.substring(0, 200),
            params
        });
    }
};

const bookingLogger = {
    created: (bookingId, userId, serviceId, barberId, date, time) => {
        appLogger.info('Booking created', {
            bookingId,
            userId,
            serviceId,
            barberId,
            date,
            time
        });
    },
    
    updated: (bookingId, updates, userId) => {
        appLogger.info('Booking updated', {
            bookingId,
            updates,
            userId
        });
    },
    
    cancelled: (bookingId, userId, reason) => {
        appLogger.info('Booking cancelled', {
            bookingId,
            userId,
            reason
        });
    },
    
    statusChanged: (bookingId, oldStatus, newStatus, changedBy) => {
        appLogger.info('Booking status changed', {
            bookingId,
            oldStatus,
            newStatus,
            changedBy
        });
    }
};

module.exports = {
    accessLogger,
    errorLogger,
    combinedLogger,
    requestLogger,
    appLogger,
    securityLogger,
    dbLogger,
    bookingLogger
};