const { Sequelize, sequelize } = require("../config/sequlize");

const ElectionMaster = sequelize.define(
    "ElectionMaster",
    {
        ElectionMasterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        ElectionName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
      AssemblyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      LoksabhaName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      VidhanSabhaName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      CommisionOfficer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
        ElectionDate :{
            type: Sequelize.DATE,
            allowNull: true,
        },
        OtherInformation:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        ResultDate:{
            type: Sequelize.DATE,
            allowNull: true,
        },
        ElectionType:{
          type: Sequelize.ENUM,
          values: ["assembly", "loksabha", "panchayat","ward"],
          allowNull: true,

        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = ElectionMaster;
