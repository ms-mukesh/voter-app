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
    production: {
        HOST: "172.20.10.3",
        USER: "root",
        PASSWORD: "rzacFp34n;ZTMe",
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
        port: process.env.PORT || 3101,
    },
};

module.exports = env_var[cenv];
