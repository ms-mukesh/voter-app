const { Sequelize, sequelize } = require("../config/sequlize");

const NativePlaceMaster = sequelize.define(
    "NativePlaceMaster",
    {
        NativePlaceId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        Name: {
            type: Sequelize.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


module.exports = NativePlaceMaster;
