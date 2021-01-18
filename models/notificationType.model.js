const { Sequelize, sequelize } = require("../config/sequlize");

const NotificationTypeMaster = sequelize.define(
  "NotificationTypeMaster",
  {
    NotificationTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    TypeName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = NotificationTypeMaster;
