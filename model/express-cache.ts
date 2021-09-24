
//import redis from "redis";
import { NextFunction, Request, Response } from "express";
import expressRedisCache from "express-redis-cache";


const RedisServer = require('redis-server');
export const redisClient = new RedisServer();
//export const redisClient = redis.createClient(6379, '127.0.0.1');

redisClient.on("error", function (item: any) {
    console.log(item);
});
redisClient.on("ready", function (item: any) {
    console.log(item);
});
redisClient.on("erroconnectr", function (item: any) {
    console.log(item);
});
redisClient.on("end", function (item: any) {
    console.log(item);
});
redisClient.on("warning", function (item: any) {
    console.log(item);
});

export const cacheMiddleware = expressRedisCache({ client: redisClient, expire: 10 /* secondi */ });

import memorycache from "memory-cache";
import { sha1 } from "object-hash";

export const memoCache = (durationSecondi: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        //const tmp = Object.assign(req.body + req.headers + req.query);
        const tmp = '-' + JSON.stringify(req.body) + '-' + JSON.stringify(req.header) + '-' + JSON.stringify(req.query) + '-';

        const tmpmd = sha1((tmp))
        console.log(tmpmd);

        let key = '__express__' + req.url + '__MIRKO_PIZZINI__' + tmpmd
        let cachedBody = memorycache.get(key)
        if (cachedBody) {
            res.setHeader('Content-Type', 'application/json');
            res.status(cachedBody.stato).send(JSON.parse(cachedBody.body))
            return
        } else {
            /* res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            } */
            (<any>res).sendResponse = res.send
            res.send = (body: string): any => {
                memorycache.put(key, { body: body, stato: res.statusCode }, durationSecondi * 1000);
                (<any>res).sendResponse(body)
            }
            next();
        }
    }
}