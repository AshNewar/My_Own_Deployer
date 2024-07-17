import express from 'express'
import { generateSlug } from "random-word-slugs";
import {ECSClient,  RunTaskCommand} from '@aws-sdk/client-ecs'
import {Server} from 'socket.io'
import Redis from 'ioredis'

const ecsClient = new ECSClient({
    region:'',
    credentials:{
        accessKeyId : '', //IAM KEYS FROM AWS
        secretAccessKey: ''
    }
})
const config = {
    cluster : 'ECS CLUSTER ARN LINK',
    task : 'ECS TASK ARN LINK'


}
const PORT = 8001
const socketPORT = 9001

const app= express();
const subscriber = new Redis('Redis URL')

const io = new Server({cors:'*'})

io.on('connection',socket =>{
    socket.on('subscribe',channel =>{
        socket.join(channel)
        socket.emit('message',`Channel ${channel} joined Successfully`)
    })
})

io.listen(socketPORT,()=>{
    console.log('Socket Server Started On Port ',socketPORT)
})

app.use(express.json())

app.post('/project',async(req,res)=>{
    const {gitURL} = req.body
    const projectSlug = generateSlug();

    // Spin the AWS ECS CONTAINER

    const runtaskInECS = new RunTaskCommand({
        cluster: config.cluster,
        taskDefinition : config.task,
        count : 1,
        launchType: 'FARGATE',  // Fargate launch type
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ['subnet-12345678'],  // Replace with your subnet ID(s) from AWS ECS Container details
                securityGroups: ['sg-12345678'],  // Replace with your security group ID(s)
                assignPublicIp: 'ENABLED'  // or 'DISABLED'
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'my-container', // Container name
                    command: ['echo', 'Hello World'],
                    environment: [
                        { name: 'GIT_REPO_URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })

    await ecsClient.send(runtaskInECS)

    return res.status(202).json({status:'queued',data : {projectSlug , url :`http://${projectSlug}.localhost:8000`}})

})

/// Subscribes to the redis Server

const intiRedisSubscriber = async()=>{
    console.log('Subscribed to Logs')
    subscriber.psubscribe('logs:*')  // Check the matching pattern
    subscriber.on('pmessage' , (pattern , channel ,message) =>{
        io.to(channel).emit('message',message)
    })
}


intiRedisSubscriber()
app.listen(PORT,()=>{
    console.log('API Server Running On Port ', PORT);
})