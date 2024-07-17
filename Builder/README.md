## Steps To be Followed
#### Step 1
- __Create a S3 Bucket in AWS__
- **Give Public access to S3 Bucket using the public config file** 
- __Create Access Key in IAM AWS__
- __Create the DockerFile Image in AWS ECR__
- __Build the Image and Tag it Push it in the AWS ECR__
- __Create a AWS ECS and create a Task Group for the build image__


#### Step 2
- __Create A Redis Server__
- __Create a Publisher to publish the Logs__



## Commands to RUN
```

npm i @aws-sdk/client-s3
npm i mime-types // To know the file type
npm i ioredis

```