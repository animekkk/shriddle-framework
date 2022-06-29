import express from 'express';
import fetch from 'node-fetch';
import * as uuid from 'uuid';
import { config } from '../../server';
import { redis } from '../../server';

export const loginRoute = express.Router();

loginRoute.get('/', async (request, response) => {
    const code = request.query.code;
    if(code) {
        const params = new URLSearchParams();
        params.append('client_id', config.developer.discord.id);
        params.append('client_secret', config.developer.discord.secret);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', config.developer.discord.redirect);
        let data = await fetch('https://discord.com/api/v9/oauth2/token', {
            method: 'POST',
            body: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        if(data.status != 200) return response.sendStatus(data.status);
        let json = await data.json();
        data = await fetch('https://discord.com/api/v9/users/@me', {
            headers: {
                'Authorization': `${json.token_type} ${json.access_token}`
            }
        });
        if(data.status != 200) return response.sendStatus(data.status);
        json = await data.json();
        const id = json.id;
        let user = JSON.parse(await redis.hGet('riddle.users', id));
        const userCode = user?.code || uuid.v4();
        if(!user) {
            const group = {
                code: userCode,
                currentLevel: 1
            }
            await redis.hSet('riddle.groups', userCode, JSON.stringify(group));
        }
        user = {
            id,
            username: json.username,
            avatar: json.avatar,
            code: userCode
        }
        await redis.hSet('riddle.users', id, JSON.stringify(user));
        response.redirect(config.page.viewCode + `?id=${id}`);
        return;
    }
    response.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.developer.discord.id}&redirect_uri=${encodeURIComponent(config.developer.discord.redirect)}&response_type=code&scope=identify`);
});