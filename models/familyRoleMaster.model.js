const { Sequelize, sequelize } = require("../config/sequlize");

const FamilyRoleMaster = sequelize.define(
  "FamilyRoleMaster",
  {
    FamilyRoleId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["FamilyRoleId"],
      },
    ],
  }
);

module.exports = FamilyRoleMaster;
