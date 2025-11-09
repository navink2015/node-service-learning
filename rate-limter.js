const requestCount = new Map()

const rateLimiter = ({ms, limit})=>{
    return (req, res, next)=>{
        const ip = req.ip;
        const currentTime = new Date();

        if(!requestCount.has(ip)){
            requestCount.set(ip, {count: 1, firstRequestTime: currentTime} )
            return next();
        }
        
        const record = requestCount.get(ip)
        const timeSinceFirstRequest = currentTime - record.firstRequestTime;

        if(timeSinceFirstRequest < ms){
            if(record.count > limit){
                return res.status(429).send({
                    success: false, 
                    message: `retry after ${ms - timeSinceFirstRequest}`
                })
            }else{
                record.count++;
                requestCount.set(ip, record)
                return next()
            }
        } else{
            requestCount.set(ip, {count: 1, firstRequestTime: currentTime} )
            return next();
        }
    }

}

module.exports =rateLimiter;