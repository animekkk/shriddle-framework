import fs from 'fs';
import { createClient } from 'redis';
import { app } from './app';
import { logger } from './app';
import dotenv from 'dotenv';
dotenv.config();

export const config = JSON.parse(fs.readFileSync('config.json'));
export const levels = JSON.parse(fs.readFileSync('levels.json'));

export const redis = await createClient({
    host: config.redis.hostname,
    port: config.redis.port,
    password: config.redis.password
});
await redis.connect();

app.listen(config.developer.port, () => logger.info(`shriddle-framework ${process.env.npm_package_version} started 🚀 (:${config.developer.port})`));