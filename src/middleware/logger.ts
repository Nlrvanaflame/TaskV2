import pino from 'pino'
import pinoConfig from '../config/pino'

const logger = pino({
  level: pinoConfig.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})
export default logger
