const { Sequelize, sequelize } = require("../config/sequlize");


const MLAMaster = sequelize.define("MLAMaster", {
    MLAId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    Mobile: {
        type: Sequelize.STRING,
    },
    Name: {
        type: Sequelize.STRING,
    },
    Email:{
        type: Sequelize.STRING
    },
    UniqueCombinationForVersion:{
        type: Sequelize.STRING
    }

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["MLAId"],
        },
    ],
});

module.exports = MLAMaster;
