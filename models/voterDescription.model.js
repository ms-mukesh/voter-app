const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model")
const wardMaster = require("./wardMaster.model")
const VoterDetails = sequelize.define(
    "VoterDetail",
    {
        VoterDetailId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        FavourPoints: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        FavouredParty: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        IsVotedInLastElection: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        VisitedRailyCount: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        LastPersonalMeeting: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            {
                unique: false,
                fields: ["VoterDetailId"],
            },
        ],
    }
);
VoterDetails.belongsTo(voterMaster, {
    foreignKey: "VoterMasterId",
});
VoterDetails.belongsTo(wardMaster, {
    foreignKey: "WardId",
});

module.exports = VoterDetails;
