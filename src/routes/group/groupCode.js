import express from 'express';
import { redis } from '../../server';

export const groupCodeRoute = express.Router();

groupCodeRoute.get('/:clientId', async (request, response) => {
    const user = JSON.parse(await redis.hGet('riddle.users', request.params.clientId));
    if(user) {
        response.cookie('riddle_code', user.code, { maxAge: 2592000000 }); //30 days
        response.status(200).json({ code: user.code });
        return;
    }
    response.sendStatus(404);
});