const cenv = "remoteTesting";
const env_var = {
    localTesting: {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "password",
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
    // remoteTesting: {
    //     HOST: "139.59.1.188",
    //     USER: "root_admin",
    //     PASSWORD: "Abcdef123!@#",
    //     DB: "community_db",
    //     // firebaseAdmin: admin,
    //     dialect: "mysql",
    //     pool: {
    //         max: 5,
    //         min: 0,
    //         acquire: 30000,
    //         idle: 10000,
    //     },
    //
    //     port: process.env.PORT || 3100,
    // },
    remoteTesting: {
        HOST: "3.14.151.80",
        USER: "mukesh_local",
        PASSWORD: "mukesh2103",
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
        USER: "bba0cd8c7f16ac",
        PASSWORD: "9561adb4",
        DB: "heroku_2ad91348d237238",
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
