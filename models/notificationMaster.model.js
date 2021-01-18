const { Sequelize, sequelize } = require("../config/sequlize");
const NotificationTypeMaster = require("./notificationType.model");
const NotificationDetail = require("./notificationDetails.model");

const NotificationMaster = sequelize.define(
  "NotificationMaster",
  {
    NotificationId: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    Description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Title: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    NotificationImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    News: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Attachments: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Sender: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Receivers: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    DateTime: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    AllReceivers: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    UnReadFlag: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["NotificationId"],
      },
    ],
  }
);
NotificationMaster.belongsTo(NotificationTypeMaster, { foreignKey: "TypeId" });
NotificationMaster.belongsTo(NotificationDetail, {
  foreignKey: "NotificationDetailId",
});
module.exports = NotificationMaster;
