# Jobs tracking RESTful api

A RESTful jobstracking api build with nodejs, express and connected with postgresql(with sequelize). This server is build with the guidance of [NodeJS Tutorial of John Smilga udemy course](https://www.udemy.com/course/nodejs-tutorial-and-projects-course/)

## Pre setup

To have the server run successfully, create a .env file and setup the following variables in .env:

- JWT_SECRET
- JWT_LIFETIME

- FRONTEND1

- POSTG_USER
- POSTG_HOST
- IDEN_DB
- POSTG_PORT
- POSTG_PASSWORD

- HEALTH_CHECK_SECRET

Among all the env variables, only HEALTH_CHECK_SECRET is optional, it is just for the server health check.

## Run

In terminal, run

```js
npm install
npm start // with nodemon
// or
node app.js // for one time
```

## Check the result

In your terminal, you should see the following message if everything is working:

```
Connected to IDEN_DB successful.
Database initialized successfully
Server is listening on port 8080...
```

```python
if (message as expected):
    good to go and proceed to your own api server development
else:
    check the error message patiently
    solve it with google or visit the related documentation or something else
    it should not be hard.
```