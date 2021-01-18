const { Sequelize, sequelize } = require("../config/sequlize");

const OccupationMaster = sequelize.define(
  "OccupationMaster",
  {
    OccupationId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
      type: Sequelize.STRING,
    },
    Basic: {
      type: Sequelize.BIGINT,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["OccupationId"],
      },
    ],
  }
);

module.exports = OccupationMaster;
