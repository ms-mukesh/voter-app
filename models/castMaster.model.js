const { Sequelize, sequelize } = require("../config/sequlize");



const CastMaster = sequelize.define("CastMaster", {
    CastId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    CastName: {
        type: Sequelize.STRING,
    },
    CastOrigin: {
        type: Sequelize.STRING,
    },
    CastOriginator:{
        type: Sequelize.STRING,
    }

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["CastId"],
        },
    ],
});


module.exports = CastMaster;
