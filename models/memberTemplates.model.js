const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const MemberTemplatesMaster = sequelize.define(
    "MemberTemplatesMaster",
    {
        MemberTemplateId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        TemplateUrl: {
            type: Sequelize.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

MemberTemplatesMaster.belongsTo(voterMaster, {
    foreignKey: "MemberID",
});

module.exports = MemberTemplatesMaster;
