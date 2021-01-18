const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = db.Sequelize;
const {decodeDataFromAccessToken} = require("../handler/utils")
const {isDefined,getAllVolunteer} = require("../handler/common/commonMethods")
const {getEventInformationForDisplay,addNewEvent,getEventInformation} = require("../handler/event")
const {acceptAllChangesToRealData,getAllVolunteerRequest,implementVolunteerChangesToRealData,getVolunteerChanges,makeRequestToChangeVoterDetail,getBoothWiseVoterList,updateVolunteerBoothStatus,getVolunteerTask,updateTaskInformation,getVolunteerList,getBoothForVolunteer,getBoothDetailRemainingForVolunteer} = require("../handler/volunteer")

router.post(
    "/addNewEvent/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        req = req.body
        if (!isDefined(req.eventName)) {
            res.status(201).send({ data: "please enter event name", next_endpoint: "null" });
        } else if (!isDefined(req.eventDate)) {
            res.status(201).send({ data: "please enter event date", next_endpoint: "null" });
        }
        else if (!isDefined(req.eventOrgainser)) {
            res.status(201).send({ data: "please enter event orgainer", next_endpoint: "null" });
        }
        else if (!isDefined(req.eventAddress)) {
            res.status(201).send({ data: "please enter event address", next_endpoint: "null" });
        }
        else if (!isDefined(req.eventDescription)) {
            res.status(201).send({ data: "please enter event description", next_endpoint: "null" });
        }
        next();
    },
    (req, res) => {
         req = req.body
        addNewEvent(req.eventName,req.eventDescription,req.eventOrgainser,req.eventDate,req.eventAddress,req.eventGuest,req.eventTask).then((resOfAddEvent)=>{
            if(resOfAddEvent){
                res.status(200).send({ data: "event added succesfully" });
            } else {
                res.status(201).send({ data: "Failed to add event" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "Failed to add event" });
        })
    }
);

router.post(
    "/updateTaskInformation/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        req = req.body
        if (!isDefined(req.taskId)) {
            res.status(201).send({ data: "please enter task name", next_endpoint: "null" });
        } else if (!isDefined(req.workStatus)) {
            res.status(201).send({ data: "please enter status", next_endpoint: "null" });
        }
        next();
    },
    (req, res) => {
        req = req.body
        updateTaskInformation(req.taskId,req.workStatus).then((resOfAddEvent)=>{
            if(resOfAddEvent){
                res.status(200).send({ data: "updated status succesfully" });
            } else {
                res.status(201).send({ data: "Failed to updated status" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "Failed to updated status" });
        })
    }
);

router.get(
    "/getVolunteerTask/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    async (req, res) => {
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        console.log("token",tokenData)
        if(tokenData !== null){
            getVolunteerTask(tokenData.voterId).then((tasks)=>{
                if(tasks){
                    res.status(200).send({ data: tasks });
                } else {
                    res.status(201).send({ data: "task not found" });
                }
            }).catch((err)=>{
                res.status(201).send({ data: "tasks not found" });
            })
        } else {
            res.status(201).send({ data: "Task not found" });
        }

    }
);
router.get(
    "/getEventInformationForDisplay/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    (req, res) => {
        getEventInformationForDisplay().then((events)=>{
            if(events){
                res.status(200).send({ data: events });
            } else {
                res.status(201).send({ data: "event not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "event not found" });
        })
    }
);

router.get(
    "/getAllVolunteer/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    (req, res) => {
        getAllVolunteer().then((data)=>{
            if(data){
                res.status(200).send({ data: data });
            } else {
                res.status(201).send({ data: "volunteer not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "volunteer not found" });
        })
    }
);

router.post(
    "/getVolunteerBooths/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        next();
    },
    async (req, res) => {
        let resData = {volunteerBoth:[],boothWithOutVolunteer:[]}
        await getBoothForVolunteer(req.body.volunteerId).then((volunteerBoth)=>{
               if(volunteerBoth){
                   resData = {...resData,volunteerBoth:volunteerBoth}
               }
           }).catch((err)=>{})
            await getBoothDetailRemainingForVolunteer(req.body.volunteerId).then((boothWithOutVolunteer)=>{
                if(boothWithOutVolunteer){
                    resData = {...resData,boothWithOutVolunteer:boothWithOutVolunteer}
                }
            }).catch((err)=>{})
            if(resData!==null){
                return res.status(200).send({ data: resData });
            } else {
                return res.status(201).send({ data: "data not found" });
            }
    }
);

router.get(
    "/getVolunteerBoothsUsingToken/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        next();
    },
    async (req, res) => {
        let resData = {volunteerBoth:[],boothWithOutVolunteer:[]}
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            return res.status(201).send({ data: "data not found" });
        }
        await getBoothForVolunteer(tokenData.voterId).then((volunteerBoth)=>{
            if(volunteerBoth){
                resData = {...resData,volunteerBoth:volunteerBoth}
            }
        }).catch((err)=>{})
        // await getBoothDetailRemainingForVolunteer(req.body.volunteerId).then((boothWithOutVolunteer)=>{
        //     if(boothWithOutVolunteer){
        //         resData = {...resData,boothWithOutVolunteer:boothWithOutVolunteer}
        //     }
        // }).catch((err)=>{})
        if(resData!==null){
            return res.status(200).send({ data: resData });
        } else {
            return res.status(201).send({ data: "data not found" });
        }
    }
);

router.post(
    "/updateVolunteerBoothStatus/",
    (req, res, next) => {
        req = req.body
        if (!isDefined(req.volunteerId)) {
            return res.status(201).send({ data: "please provide volunteer" });
        }
        else if (!isDefined(req.wardId)) {
            return res.status(201).send({ data: "please provide ward" });
        }
        next();
    },
    async (req, res) => {
        req = req.body
        updateVolunteerBoothStatus(req).then((isUpdated)=>{
            if(isUpdated){
                return res.status(200).send({ data: "Updated.." });
            } else {
                return res.status(201).send({ data: "fail to update..." });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "fail to update..." });
        })
    }
);

router.post(
    "/getBoothWiseVoterList/",
    (req, res, next) => {
        if (!isDefined(req.body.boothId)) {
            return res.status(201).send({ data: "please provide Booth data" });
        }
        next();
    },
    async (req, res) => {
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            return res.status(201).send({ data: "in appropriate volunteer details" });
        }


        await getBoothWiseVoterList(req.body.boothId,tokenData.voterId).then((boothWiseList)=>{
            if(boothWiseList){
                return res.status(200).send({ data: boothWiseList });
            } else {
                return res.status(201).send({ data: "data not found" });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "data not found" });
        })
    }
);
router.post(
    "/makeRequestToChangeVoterDetail",(req,res,next)=>{
        let data = req.body;
        next()

    },
    async (req, res) => {
        let data = req.body;
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            return res.status(201).send({ data: "in appropriate volunteer details" });
        }
        console.log(data)
        // return res.status(201).send({ data: "in appropriate volunteer details" });
        makeRequestToChangeVoterDetail(tokenData.voterId,data).then((isRequestSaved)=>{
            if(isRequestSaved){
                return res.status(200).send({ data: "Request saved sucessfully.." });
            } else {
                return res.status(201).send({ data: "Failed to save request.." });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "Failed to save request.." });
        })
    }
);

router.post(
    "/getVolunteerChanges",(req,res,next)=>{
        if (!isDefined(req.body.volunteerId)) {
            return res.status(201).send({ data: "please provide Volunteer data" });
        }
        next();
    },
    async (req, res) => {
        getVolunteerChanges(req.body.volunteerId).then((volunteerChanges)=>{
            if(volunteerChanges){
                return res.status(200).send({ data: volunteerChanges });
            } else {
                return res.status(201).send({ data: "No changes Found for this volunteer" });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "No changes Found for this volunteer.." });
        })
    }
);

router.post(
    "/applyChangeToRealData",(req,res,next)=>{
        if(!isDefined(req.body.volunteerId)){
            return res.status(201).send({ data: "Please provide volunteer data" });
        }
        next();
    },
    async (req, res) => {
        implementVolunteerChangesToRealData(req.body).then((volunteerChanges)=>{
            if(volunteerChanges){
                return res.status(200).send({ data: "Succesfully changed" });
            } else {
                return res.status(201).send({ data: "No changes Found for this volunteer" });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "No changes Found for this volunteer.." });
        })
    }
);
router.get(
    "/getVolunteerAllRequests",(req,res,next)=>{
        next();
    },
    async (req, res) => {
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            return res.status(201).send({ data: "in appropriate volunteer details" });
        }
        getAllVolunteerRequest(tokenData.voterId).then((requestData)=>{
            if(requestData){
                return res.status(200).send({ data: requestData });
            } else {
                return res.status(201).send({ data: "in appropriate volunteer details" });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "in appropriate volunteer details" });
        })

    }
);
router.post(
    "/acceptAllChangesOfVolunteer",(req,res,next)=>{
        if(!isDefined(req.body.volunteerId)){
            return res.status(201).send({ data: "Please provide volunteer data" });
        }
        next();
    },
    async (req, res) => {
        acceptAllChangesToRealData(req.body).then((volunteerChanges)=>{
            if(volunteerChanges){
                return res.status(200).send({ data: "Succesfully changed" });
            } else {
                return res.status(201).send({ data: "No changes Found for this volunteer" });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "No changes Found for this volunteer.." });
        })
    }
);
module.exports = router;
