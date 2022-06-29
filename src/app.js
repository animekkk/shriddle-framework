import express from 'express';
import SimpleNodeLogger from 'simple-node-logger';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as routes from './routes';
import * as middleware from './middleware';

export const logger = SimpleNodeLogger.createSimpleLogger({ logFilePath: 'logs.log' });

export const app = express();

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

app.use(cookieParser());

app.use('/login', routes.loginRoute);
app.use('/group', routes.groupCodeRoute);

app.use('/', express.static('./page', { extensions: ['html', 'htm'] }));
app.use('/levels', middleware.checkLevel, express.static('./levels'));

app.use('/levels/*', (req, res) => res.sendFile('/page/views/notfound.html', { root: '.' }));
app.use('/*', (req, res) => res.redirect('/'));