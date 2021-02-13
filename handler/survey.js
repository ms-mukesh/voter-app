const db = require("../models");
const loadash = require("lodash")
const moment = require("moment")
const {survey_answer_master,survey_master,survey_question_master,voterMaster,familyMaster,trustFactorMaster,occupationMaster,addressMaster,nativePlaceMaster} = db
const {Op} = db.Sequelize
const {defaultQuestion,VOTER_ATTRIBUTES,DATABASE_NAME} = require("../handler/common/constants")
const {getAllVolunteerId,getAllAdminMemberId} = require("../handler/common/commonMethods")
const {sequelize} = require("../config/sequlize");
const getSurveyList = () =>{
    return new Promise((resolve)=>{
        survey_master.findAll().then((res)=>{
            if(res){
                return resolve(res)
            } else{
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })
}
const addNewSurvey = (obj) =>{
    return new Promise((resolve)=>{
        survey_master.create(obj).then(async (isCreated)=>{
            if(isCreated){
                const result = await defaultQuestion.map( function(el) {
                    var o = Object.assign({}, el);
                    o.SurveyId = isCreated.dataValues.SurveyId;
                    return o;
                })
                if(result.length>0){
                    survey_question_master.bulkCreate(result).then((isQuestionCreated)=>{
                        if(isQuestionCreated){
                            return resolve(true)
                        } else {
                            return resolve(false)
                        }
                    }).catch((err)=>{
                        return resolve(false)
                    })
                } else {
                    return resolve(false)
                }
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })
}
const getSurveyQuestions = (surveyId) =>{
    let condition = {SurveyId: { [Op.eq]: surveyId }};
    return new Promise((resolve)=>{
        survey_question_master.findAll({where:condition}).then((surveyQuestions)=>{
            if(surveyQuestions){
                return resolve(surveyQuestions)
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })

}
const addNewSurveyQuestion = (question,surveyId) =>{
    let obj = {Question:question,SurveyId:surveyId}
    return new Promise((resolve)=>{
        survey_question_master.create(obj).then((isNewQuestionCreated)=>{
            if(isNewQuestionCreated){
                return resolve(true)
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })

}

const getAllVoterWhoDoesNotParticipate = (boothId,surveyId) =>{
    return new Promise(async (resolve)=>{
        let condition = { BoothId: { [Op.eq]: boothId}};
        let volunteerCondition = null;
        let tempVoterId = []
        await getAllAdminMemberId().then((adminId)=>{
            if(adminId){
                tempVoterId.push(...adminId)
            }
        })
        await getAllVolunteerId().then((volunteerId)=>{
            if(volunteerId){
                tempVoterId.push(...volunteerId)
            }
        })
        condition = {...condition,VoterId: { [Op.notIn]: tempVoterId },}
        let tempMemberArray = [];
        voterMaster
            .findAll({
                attributes: VOTER_ATTRIBUTES,
                where: condition,
                order: [
                    [
                        sequelize.fn(
                            "concat",
                            sequelize.col("VoterMaster.FirstName"),
                            sequelize.col("VoterMaster.MiddleName"),
                            sequelize.col("VoterMaster.LastName")
                        ),
                        "ASC",
                    ],
                ],
                include: [
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "MotherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "FatherInLawDetail",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "MotherInLawDetail",
                    },
                    {
                        attributes: ["Name"],
                        model: occupationMaster,
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["TrustFactorId","Name","Color","ExtraMessage"],
                        model: trustFactorMaster,
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["FamilyId", "HeadId"],
                        model: familyMaster,
                        include: [
                            {
                                model: addressMaster,
                            },
                            {
                                attributes: ["Name"],
                                model: nativePlaceMaster,
                            },
                        ],
                    },
                ],
            })
            .then(async (res) => {
                if(res && res.length>0){
                    let responseArray = []
                    sequelize.query("select * from "+DATABASE_NAME+".VoterMaster where VoterId not in (SELECT VoterId From "+DATABASE_NAME+".SurveyAnswerMaster where SurveyId ="+surveyId+")").then(async (voterReqData)=>{
                        if(voterReqData && voterReqData[0].length>0){
                            responseArray = await res.filter(x=>{
                                return !voterReqData[0].some(t=> t.VoterId === x.VoterId)
                            })
                            responseArray = await res.filter(x=>{
                                return !responseArray.some(t=> t.VoterId === x.VoterId)
                            })
                            return resolve(responseArray)
                        } else {
                            resolve(res)
                        }
                    }).catch((err)=>{
                        console.log("called",err)
                        resolve(res)
                    })
                } else {
                    resolve(false)
                }
            })
            .catch((err) => {
                console.log("error--",err)
                resolve(false)
            });
    })
}
const getSurveyReport = (surveyId) =>{
    return new Promise((resolve)=>{
        let condition = {
            SurveyId: { [Op.eq]: surveyId },
        };
        survey_answer_master.findAll({where:condition,
            attributes:['Answer'],
            include:[
                {
                    model:voterMaster,
                    attributes:['FirstName','MiddleName','VoterVotingId'],
                    order: [
                        [
                            sequelize.fn(
                                "concat",
                                sequelize.col("VoterMaster.VoterId"),
                            ),
                            "ASC",
                        ],
                    ],
                },
                {
                    model: voterMaster,
                    attributes:['FirstName','MiddleName','VoterVotingId'],
                    as: "VolunteerDetail",
                },
                {
                    model:survey_master
                },
                {
                    model:survey_question_master,
                    attributes:['Question'],
                }

            ]

        }).then((res)=>{
            if(res){
                return resolve(res)
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })
}
const addVoterAnswerForSurvey = (dataArray) =>{
    return new Promise((resolve)=>{
        survey_answer_master.bulkCreate(dataArray).then((isCreated)=>{
            if(isCreated){
                return resolve(true)
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })
    })
}
module.exports = {getSurveyReport,addVoterAnswerForSurvey,getAllVoterWhoDoesNotParticipate,getSurveyList,addNewSurvey,getSurveyQuestions,addNewSurveyQuestion}
