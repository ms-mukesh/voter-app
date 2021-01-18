const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const wardMaster = require("./wardMaster.model");

const Volunteer_Booth = sequelize.define("Volunteer_Booth", {
    DataId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },

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
Volunteer_Booth.belongsTo(voterMaster, { foreignKey: "VolunteerId" });
Volunteer_Booth.belongsTo(wardMaster, { foreignKey: "BoothId" });

module.exports = Volunteer_Booth;
