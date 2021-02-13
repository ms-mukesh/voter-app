const { Sequelize, sequelize } = require("../config/sequlize");
const surveyMaster = require("./surveyMaster.Model");

const SurveyQuestionMaster = sequelize.define(
    "SurveyQuestionMaster",
    {
        QuestionId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Question: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            {
                unique: false,
                fields: ["QuestionId"],
            },
        ],
    }
);
SurveyQuestionMaster.belongsTo(surveyMaster, {
    foreignKey: "SurveyId",
});
module.exports = SurveyQuestionMaster;
