const { Sequelize, sequelize } = require("../config/sequlize");
const TrustFactor = sequelize.define("TrustFactor", {
    TrustFactorId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: Sequelize.STRING,
    },
    Color:{
        type: Sequelize.STRING,
    },
    ExtraMessage:{
        type: Sequelize.STRING,
    }
},{
    freezeTableName: true,
    timestamps: false,
});


module.exports = TrustFactor;
