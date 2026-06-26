import pino from 'pino';
import { env } from '../config/env';

let usePretty = false;
if (env.NODE_ENV === 'development') {
    try {
        require.resolve('pino-pretty');
        usePretty = true;
    } catch {
        // pino-pretty tidak terinstall, gunakan default logging
    }
}

export const logger = pino({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: usePretty
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
        : undefined,
});
