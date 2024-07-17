## Steps To be Followed


#### Step 1

- __Install The Required Package__
- __After Creating a ECS in AWS__
- __Task group and cluster link paste__

#### Step 2
- __Create redis And Socket Server__
- __Listen to the Redis Server__

#### Step 3 Postgre Setup with Prisma
- Prisma Setup 
_ Postgres Host on Aiven 
- Get the DB Link And CA cert. from aiven 
- Paste the Ca Cert in Prisma Folder
- After creating the model run the cmd to migrate
```
npx prisma migrate dev --name init
```
## Commands to RUN
```

npm install @aws-sdk/client-ecs
npm i socket.io ioredis

```