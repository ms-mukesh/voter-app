const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = db.Sequelize;
const {isDefined,getAllVolunteer} = require("../handler/common/commonMethods")
const {getSurveyReport,addVoterAnswerForSurvey,getSurveyList,addNewSurvey,getSurveyQuestions,addNewSurveyQuestion,getAllVoterWhoDoesNotParticipate} = require("../handler/survey")
const {defaultQuestion} = require("../handler/common/constants")
const {survey_question_master} = db
const {decodeDataFromAccessToken} = require('../handler/utils')

router.get(
    "/getSurveyList/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    async (req, res) => {
        getSurveyList().then((surveys)=>{
            if(surveys){
                res.status(200).send({ data: surveys });
            } else {
                res.status(201).send({ data: "surveys not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "surveys not found" });
        })
    }
);
router.post(
    "/addNewSurvey/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.SurvayName)){
            return res.status(201).send({ data: "please add Survay Name" });
        }
        else if(!isDefined(data.SurveyStartDate)){
            return res.status(201).send({ data: "please add Survey Start Date" });
        }
        else if(!isDefined(data.SurveyEndDate)){
            return res.status(201).send({ data: "please add Survey End Date" });
        }
        else if(!isDefined(data.SurveyDescription)){
            return res.status(201).send({ data: "please add Survey Description" });
        }
        next();
    },
    async (req, res) => {
        addNewSurvey(req.body).then((surveys)=>{
            if(surveys){
                res.status(200).send({ data: "survey created" });
            } else {
                res.status(201).send({ data: "fail to create survey" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "fail to create survey" });
        })
    }
);
router.post(
    "/getSurveyQuestions/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.surveyId)){
            return res.status(201).send({ data: "please provide Survay Details" });
        }
        next();
    },
    async (req, res) => {
        getSurveyQuestions(req.body.surveyId).then((surveysQstion)=>{
            if(surveysQstion){
                res.status(200).send({ data: surveysQstion });
            } else {
                res.status(201).send({ data: "data not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "data not found" });
        })
    }
);
router.post(
    "/addNewSurveyQuestion/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.surveyId)){
            return res.status(201).send({ data: "please provide Survay Details" });
        }
        else if(!isDefined(data.question)){
            return res.status(201).send({ data: "please provide Survay Question" });
        }
        next();
    },
    async (req, res) => {
        addNewSurveyQuestion(req.body.question,req.body.surveyId).then((isCreated)=>{
            if(isCreated){
                res.status(200).send({ data: "added" });
            } else {
                res.status(201).send({ data: "fail to add" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "fail to add" });
        })
    }
);
router.post(
    "/getAllVoterWhoDoesNotParticipate/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.boothId)){
            return res.status(201).send({ data: "please provide Booth Details" });
        } else if(!isDefined(data.surveyId)){
            return res.status(201).send({ data: "please provide Survey Details" });
        }
        next();
    },
    async (req, res) => {
        getAllVoterWhoDoesNotParticipate(req.body.boothId,req.body.surveyId).then((boothLevelData)=>{
            if(boothLevelData){
                res.status(200).send({ data: boothLevelData });
            } else {
                res.status(201).send({ data: "fail to find data" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "fail to find data" });
        })
    }
);
router.post(
    "/AddVoterAnswerForSurvey/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.dataArray)){
            return res.status(201).send({ data: "please provide Answer Details" });
        }
        next();
    },
    async (req, res) => {
        let dataArray = req.body.dataArray;
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            res.status(201).send({ data: "fail to add answer" });
        } else {
            const outputArray = await dataArray.map( function(el) {
                let o = Object.assign({}, el);
                o.VolunteerId = tokenData.voterId;
                return o;
            })
            addVoterAnswerForSurvey(outputArray).then((isDataAdded)=>{
                if(isDataAdded){
                    res.status(200).send({ data: "Added" });
                } else {
                    res.status(201).send({ data: "fail to add data" });
                }
            }).catch((err)=>{
                res.status(201).send({ data: "fail to add data" });
            })

        }
    }
);
router.post(
    "/getSurveyReport/",
    (req, res, next) => {
        let data = req.body
        if(!isDefined(data.surveyId)){
            return res.status(201).send({ data: "please provide Survey Details" });
        }
        next();
    },
    async (req, res) => {
        getSurveyReport(req.body.surveyId).then((surveyReport)=>{
            if(surveyReport){
                res.status(200).send({ data: surveyReport });
            } else {
                res.status(201).send({ data: "no data found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "no data found" });
        })
    }
);
module.exports = router;
