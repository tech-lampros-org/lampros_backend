import winston from "winston";
import path, { format } from 'path'
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors ( { stack: true } ),
        winston.format.printf (( { timestamp, message, level, stack })=>{
            return `${timestamp} ${level}: ${message} ${stack ? '\n' + stack : ''}`
        })
    ),
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new DailyRotateFile({
            filename: path.join(path.resolve(), 'logs-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '100',
            format: winston.format.json()
         })
    ] 

})

export default logger;