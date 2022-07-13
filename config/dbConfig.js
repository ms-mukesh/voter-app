const cenv = "localTesting";
const env_var = {
    localTesting: {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "Mukesh@123",
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
        HOST: "localhost",
        USER: "mukesh",
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
    ec2RemoteDb: {
        HOST: "167.71.235.234",
        USER: "root",
        PASSWORD: "Mukesh@123",
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
};

module.exports = env_var[cenv];
