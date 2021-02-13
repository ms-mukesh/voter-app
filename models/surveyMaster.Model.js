const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");

const SurveyMasterModel = sequelize.define("SurveyMaster", {
    SurveyId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    SurvayName: {
        type: Sequelize.STRING,
    },
    SurveyStartDate: {
        type: Sequelize.DATE,
    },
    SurveyEndDate:{
        type: Sequelize.DATE,
    },
    SurveyDescription :{
        type: Sequelize.STRING,
    }

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["SurveyId"],
        },
    ],
});

SurveyMasterModel.belongsTo(voterMaster, {
    foreignKey: "CreatedBy",
});

module.exports = SurveyMasterModel;
