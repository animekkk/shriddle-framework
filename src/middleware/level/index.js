import { levels } from '../../server';
import { redis } from '../../server';
import { logger } from '../../app';

export async function checkLevel(req, res, next) {
    const code = req.cookies.riddle_code;
    if(!code) {
        res.status(403).send('Cannot find code for your group. Try to log in again.');
        return;
    }
    const group = JSON.parse(await redis.hGet('riddle.groups', code));
    if(!group) {
        res.status(403).send('Your group does not exist. Try to log in again.');
        return;
    }

    const path = req.path;
    const levelPath = path.substring(1, path.lastIndexOf('/'));

    const currentLevel = levels.find(level => level.path === levelPath);
    if(!currentLevel) return next();
    const nextLevel = levels.find(level => level.id === (currentLevel.id + 1));

    if(group.currentLevel < currentLevel.id) {
        res.sendFile('/page/views/noaccess.html', { root: '.' })
        return;
    }

    const fileName = path.substring(path.lastIndexOf('/') + 1);
    if(fileName === currentLevel.answer) {
        if(currentLevel.id === group.currentLevel) {
            group.currentLevel += 1;
            await redis.hSet('riddle.groups', group.code, JSON.stringify(group));
            logger.info(`${group.code} has passed level ${currentLevel.id} (${currentLevel.name})`);
        }
        if(!nextLevel) {
            res.sendFile('/page/views/end.html', { root: '.' })
            return;
        }
        res.redirect(`/levels/${nextLevel.path}/${nextLevel.index}`);
        return;
    }

    next();
}