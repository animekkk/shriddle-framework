import express from 'express';
import SimpleNodeLogger from 'simple-node-logger';

export const logger = SimpleNodeLogger.createSimpleLogger({ logFilePath: 'logs.log' });

export const app = express();