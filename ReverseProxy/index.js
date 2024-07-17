import express from 'express'
import httpProxy from 'http-proxy'

const PORT = 8000

// const BASE_PATH = `${S3_Bucket_URL}/__outputs`
const BASE_PATH = ""

const app = express();

const proxy = httpProxy.createProxy();

app.use((req,res)=>{
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolveTo = `${BASE_PATH}/${subdomain}`

    return proxy.web(req, res, { target:resolveTo , changeOrigin: true });
})

// if the url does not specify which file to access then my default it will map to index.html
proxy.on('proxyReq',(proxyReq,req,res)=>{
    const url = req.url;
    if(url=='/') proxyReq+='index.html'
})

app.listen(PORT,()=>{
    console.log(`Reverse Proxy Running.. on ${PORT}`)
})