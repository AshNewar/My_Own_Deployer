import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mime from 'mime-types'
import Redis from 'ioredis'

const client = new S3Client({
    region:'',
    credentials:{
        accessKeyId : '', //IAM KEYS FROM AWS
        secretAccessKey: ''
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

// PUB AND SUB METHOD IN REDIS
const redisPublisher = new Redis('redis Url')

const publishLog =(log) =>{
    redisPublisher.publish(`logs:${PROJECT_ID}`,JSON.stringify({log}))
}

const init = ()=>{
    console.log("Executing Script file")
    publishLog('Build Started')
    const outputPath = path.join(__dirname , "output")
    const bashCmd = exec(`cd ${outputPath} && npm install && npm run build`)

    bashCmd.stdout.on('data',(data)=>{
        console.log(data.toString())
        publishLog(data.toString())
    })

    bashCmd.stdout.on('error',()=>{
        console.log('Error',data.toString())
        publishLog(` Error ${data.toString()}`)
    })

    bashCmd.stdout.on('close',async()=>{
        console.log('Build Complete')
        publishLog('Build Completed')

        // Dist folder contains all the static file like html css assets js
        const distFolderPath = path.join(__dirname , 'output' , 'dist')
        const distContent  = fs.readdirSync(distFolderPath,{recursive:true})

        publishLog('Uploading Started')

        for(const file of distContent){
            const filePath = path.join(distFolderPath , file);
            if(fs.lstatSync(filePath).isDirectory()) continue;

            console.log('Uploading file ', filePath);
            publishLog(`Uploading file ${file}`)


            // Put in the S3 Bucket
            const command = new PutObjectCommand({
                Bucket: "test-bucket",
                Key: `__output/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            });
            
            try {
                const response = await client.send(command);
                console.log('Files Copied to S3 Bucket ' , response);
                publishLog(`Uploaded file ${file}`)

            } catch (err) {
                console.error(err);
                publishLog(`Error ${err}`)

            }
        }
        publishLog('Done...')


    })
    
}

init();