const { Sequelize, sequelize } = require("../config/sequlize");
const addressMaster = require("./addressMaster.model");
const WardMasterModel = sequelize.define("WardMaster", {
    WardId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    WardName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    WardAddress : {
        type: Sequelize.STRING,
        allowNull: true
    },
    WardCity:{
        type: Sequelize.STRING,
        allowNull: true
    },
    DistrictName:{
        type: Sequelize.STRING,
        allowNull: true
    },
    WardState:{
        type: Sequelize.STRING,
        allowNull: true
    },
    SecurityLevelOnWard: {
        type: Sequelize.STRING,
        allowNull: true
    },
    WardCode:{
        type: Sequelize.STRING,
        allowNull: true
    }

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["WardId"],
        },
    ],
});
module.exports = WardMasterModel;
