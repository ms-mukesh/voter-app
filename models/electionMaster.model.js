const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const ElectionMaster = sequelize.define(
    "ElectionMaster",
    {
        ElectionMasterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        ElectionName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        ElectionDate :{
            type: Sequelize.DATE,
            allowNull: true,
        },
        OtherInformation:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        ResultDate:{
            type: Sequelize.DATE,
            allowNull: true,
        },
        ElectionType:{
            type: Sequelize.STRING,
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = ElectionMaster;
