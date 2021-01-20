const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const electionMaster = require("./electionMaster.model");

const Election_Voter = sequelize.define("Election_Voter", {
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
Election_Voter.belongsTo(voterMaster, { foreignKey: "VoterId" });
Election_Voter.belongsTo(electionMaster, { foreignKey: "ElectionId" });

module.exports = Election_Voter;
