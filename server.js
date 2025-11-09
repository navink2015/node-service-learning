const cluster = require('cluster');
const express = require('express');
const app = express();
const os = require('os');
const cors = require('cors');
const rateLimiter = require('./rate-limter');

const orginList = ['www.google.com', 'apple.com', 'localhost:3000']

app.use(cors({
    origin: function (origin, callback){
        console.log("origin--->", origin)
        if(!origin || orginList.includes(origin)) {
            callback(null, true)
        }else{
            callback(new Error('not allowed by cros'))
        }
    },
    methods: ['GET','POST', 'PUT', 'DELETE'],
    Credentials: true,
}))

app.use(rateLimiter({ms: 10, limit:5}));

const noOfCpus = os.cpus().length;
console.log("number of cpus",noOfCpus)

if(cluster.isMaster){
    console.log("cluster is master", process.pid);

    for(let i=0; i<noOfCpus ; i++){
        cluster.fork()
    }
    cluster.on('exit', ()=>{
        console.log(`cluster is closed ${process.pid}`)
        cluster.fork()
    })

}else{

    
app.use('/api', (req,res)=>{
    res.status(200).send({message: 'success'})
})

const promiseFunction = ()=>{
    return new Promise((resolve, reject)=>{
        const a = true;
        setTimeout(()=>{
            if(a){
                resolve('promise sucess')
            }else{
                reject('promise rejected')
            }
        }, 2000)
    })
}

app.use('/promise', async(req,res)=>{
     await promiseFunction(res).then((data)=>{
        console.log(data)
         res.status(200).send({message: 'success', data})
     }).catch((e)=>{
         res.status(500).send({message: 'failed', e})

     }).finally(()=>{
        console.log("response send to promise")
     })

})

app.listen(3000, ()=>{
    console.log(`server is running at 3000 at ${process.pid}`)
})

}
