const { Sequelize, sequelize } = require("../config/sequlize");

const VoterListMaster = sequelize.define(
    "VoterListMaster",
    {
        voterUniqueId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        electionId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        boothId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        voterName:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        village: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        voterCategory: {
          type: Sequelize.ENUM,
          values: ["green", "red", "yellow"],
            allowNull: true,
        },
      gender: {
        type: Sequelize.ENUM,
        values: ["male", "female", "other"],
        allowNull: true,
      },

        mandalName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        shaktiKendraName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        familyNumber:{
          type: Sequelize.STRING,
          allowNull: true
        },
      dob: {
        type: Sequelize.DATE,
        allowNull:true
      },

    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);
module.exports = VoterListMaster;
