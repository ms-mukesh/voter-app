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
    },
    WardAddress : {
        type: Sequelize.STRING,
    },
    WardCity:{
        type: Sequelize.STRING,
    },
    DistrictName:{
        type: Sequelize.STRING,
    },
    WardState:{
        type: Sequelize.STRING,
    },
    SecurityLevelOnWard: {
        type: Sequelize.STRING,
    },
    WardCode:{
        type: Sequelize.STRING
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
