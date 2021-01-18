const { Sequelize, sequelize } = require("../config/sequlize");
const addressMaster = require("./addressMaster.model");
const nativeMaster = require("./nativePlaceMaster.model");
const castMaster = require("./castMaster.model");

const FamilyMaster = sequelize.define(
  "FamilyMaster",
  {
    FamilyId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    HeadId: {
      type: Sequelize.BIGINT,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

FamilyMaster.belongsTo(addressMaster, {
  foreignKey: "ResidenceAddressId",
});
FamilyMaster.belongsTo(nativeMaster, {
  foreignKey: "NativePlaceId",
});
FamilyMaster.belongsTo(castMaster, {
    foreignKey: "CastId",
});

module.exports = FamilyMaster;
