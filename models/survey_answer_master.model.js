const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const surveyQuestionMaster = require("./surveyQuestionMaster.model");
const surveyMaster = require("./surveyMaster.Model");

const SurveyAnswerMaster = sequelize.define("SurveyAnswerMaster", {
    AnswerId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    Answer: {
        type: Sequelize.STRING,
    },

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["AnswerId"],
        },
    ],
});
SurveyAnswerMaster.belongsTo(voterMaster, { foreignKey: "VoterId" });
SurveyAnswerMaster.belongsTo(voterMaster, { foreignKey: "VolunteerId", as: "VolunteerDetail", });
SurveyAnswerMaster.belongsTo(surveyQuestionMaster, { foreignKey: "QuestionId" });
SurveyAnswerMaster.belongsTo(surveyMaster, { foreignKey: "SurveyId" });

module.exports = SurveyAnswerMaster;
