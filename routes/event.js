const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = db.Sequelize;
const {isDefined,getAllVolunteer} = require("../handler/common/commonMethods")
const {getMemberTemplateList,addMemberTemplateToDb,getTemplateList,getEventInformationForDisplay,addNewEvent,getEventInformation,updateTaskInformation} = require("../handler/event")
const {covertPdfToImage} = require("../handler/voterData")
const {decodeDataFromAccessToken} = require('../handler/utils')

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
        } else if (!isDefined(req.volunteerId)) {
            res.status(201).send({ data: "please enter volunteer name", next_endpoint: "null" });
        }
        next();
    },
    (req, res) => {
        req = req.body
        updateTaskInformation(req.volunteerId,req.taskId).then((resOfAddEvent)=>{
            if(resOfAddEvent){
                res.status(200).send({ data: "assign task succesfully" });
            } else {
                res.status(201).send({ data: "Failed to assign task" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "Failed to assign task" });
        })
    }
);
router.post(
    "/addMemberTemplateToDb/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        req = req.body
        console.log("data---",req)
        if (!isDefined(req.templateImage)) {
            return res.status(201).send({ data: "please send image" });
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
        req = req.body;
        if(tokenData === null){
            return res.status(201).send({ data: "Failed to add template" });
        } else {
            covertPdfToImage(req.templateImage).then((isUrlCreated)=>{
                if(isUrlCreated){
                    let obj = {
                        TemplateUrl:isUrlCreated,
                        MemberID:tokenData.voterId
                    }
                    console.log(obj)

                    addMemberTemplateToDb(obj).then((isCreated)=>{
                        console.log("ress--",isCreated)
                        if(isCreated){
                            res.status(200).send({ data: "added succesfully" });
                        } else {
                            res.status(201).send({ data: "Failed to add" });
                        }
                    }).catch((err)=>{
                        console.log("error--",err)
                        res.status(201).send({ data: "Failed to add" });
                    })
                } else {
                    return res.status(201).send({ data: "Failed to add" });
                }
            })
        }
    }
);

router.post(
  "/addMemberTemplateToDbNew/",
  (req, res, next) => {
      // eslint-disable-next-line no-restricted-globals
      req = req.body
      console.log("data---",req)
      if (!isDefined(req.templateImage)) {
          return res.status(201).send({ data: "please send image" });
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
      req = req.body;
      if(tokenData === null){
          return res.status(201).send({ data: "Failed to add template" });
      } else {
          let obj = {
              TemplateUrl:req.templateImage,
              MemberID:tokenData.voterId
          }
          addMemberTemplateToDb(obj).then((isCreated)=>{
              if(isCreated){
                  res.status(200).send({ data: "added succesfully" });
              } else {
                  res.status(201).send({ data: "Failed to add" });
              }
          }).catch((err)=>{
              console.log("error--",err)
              res.status(201).send({ data: "Failed to add" });
          })
      }
  }
);
router.get(
    "/getMemberTemplates/",
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
        if(tokenData === null){
            return res.status(201).send({ data: "List not found" });
        }
        getMemberTemplateList(tokenData.voterId).then((templates)=>{
            if(templates){
                res.status(200).send({ data: templates });
            } else {
                res.status(201).send({ data: "List not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "List not found" });
        })
    }
);


router.get(
    "/getEventInformation/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    (req, res) => {
        getEventInformation().then((events)=>{
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
    "/getTemplateList/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals

        next();
    },
    (req, res) => {
        getTemplateList().then((templates)=>{
            if(templates){
                res.status(200).send({ data: templates });
            } else {
                res.status(201).send({ data: "templates not found" });
            }
        }).catch((err)=>{
            res.status(201).send({ data: "templates not found" });
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
//
// getEventInformation().then((res)=>{
//     console.log(res)
// })
module.exports = router;
