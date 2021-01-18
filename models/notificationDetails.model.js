const { Sequelize, sequelize } = require("../config/sequlize");

const NotificationDetail = sequelize.define(
  "NotificationDetail",
  {
    NotificationDetailId: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    Location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    FromDate: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ToDate: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Cause: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    MinLimit: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    MaxLimit: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    CloseDate: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    Organizer: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    NewsType: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
module.exports = NotificationDetail;
