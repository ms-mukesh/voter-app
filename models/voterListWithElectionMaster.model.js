const { Sequelize, sequelize } = require("../config/sequlize");
const electionMaster = require("./electionMaster.model");
const voterListMaster = require("./voterList.model");
const VoterListElectionMaster = sequelize.define("VoterListElectionMaster", {
  DataId:{
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  dateTime:{
    type: Sequelize.STRING,
    allowNull: true,
  }

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
VoterListElectionMaster.belongsTo(voterListMaster, { foreignKey: "VoterId" });
VoterListElectionMaster.belongsTo(electionMaster, { foreignKey: "ElectionId" });

module.exports = VoterListElectionMaster;
