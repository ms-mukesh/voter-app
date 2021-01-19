const cenv = "localTesting";
// const admin = require("firebase-admin");
// eslint-disable-next-line import/no-unresolved
// const serviceAccount = require("../firebase/navgam-production-firebase-adminsdk-rifa7-86a0dd388c.json");
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://navgam-production.firebaseio.com",
// });

const env_var = {
    localTesting: {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "lanetteam@1",
        DB: "community_db",
        // firebaseAdmin: admin,
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        port: process.env.PORT || 3100,
    },

    liveClientTesting: {
        HOST: "us-cdbr-east-03.cleardb.com",
        USER: "bded972b8d7398",
        PASSWORD: "f29dff2d",
        DB: "heroku_0f888c1c6017d15",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        port: process.env.PORT || 3101,
    },
};

module.exports = env_var[cenv];
