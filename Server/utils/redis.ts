import { Redis } from "ioredis";
require('dotenv').config();

const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log(`Ket noi Redis thanh cong.`);
        return process.env.REDIS_URL;
    }
    throw new Error('Ket noi Redis that bai !!!')
}

export const redis = new Redis(redisClient());