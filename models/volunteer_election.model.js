const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const electionMaster = require("./electionMaster.model");
const boothMaster = require("./wardMaster.model");

const Volunteer_Election = sequelize.define("Volunteer_Election", {
    DataId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["DataId"],
        },
    ],
});
Volunteer_Election.belongsTo(voterMaster, { foreignKey: "VolunteerId" });
Volunteer_Election.belongsTo(electionMaster, { foreignKey: "ElectionId" });
Volunteer_Election.belongsTo(boothMaster, { foreignKey: "BoothId" });

module.exports = Volunteer_Election;
