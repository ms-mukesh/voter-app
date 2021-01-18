const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");

const AdminMaster = sequelize.define("AdminMaster", {
    AdminId:{
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
    }

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["AdminId"],
        },
    ],
});
AdminMaster.belongsTo(voterMaster, { foreignKey: "VoterId" });

module.exports = AdminMaster;
