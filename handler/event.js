const db = require("../models");
const loadash = require("lodash")
const moment = require("moment")
const {taskMaster,eventMaster,voterMaster,templateMaster,memberTemplateMaster} = db
const {Op} = db.Sequelize
const addNewEvent = (eventName,description,organiser,eventDate,address,guest,tasks) =>{
    return new Promise((resolve)=>{
        let eventMasterInsObj = {
            EventName:eventName,
            Description:description,
            Address:address,
            Organiser:organiser,
            Guest:guest,
            EventDate:eventDate
        }

        eventMaster.create(eventMasterInsObj).then((res)=>{
            if(res){
                if(tasks.length>0){
                    let taskInsertArray = [];
                    tasks.map((taskDetails,index)=>{
                        taskInsertArray.push({
                            TaskName : taskDetails.taskTitle,
                            Description: taskDetails.taskDescription,
                            DeadlineDate : new Date().getTime(),
                            Status : '0',
                            EventId: res.dataValues.EventId
                        })
                    })
                    console.log(taskInsertArray)
                    taskMaster.bulkCreate([...taskInsertArray]).then((resofInsert)=>{
                        if(resofInsert){
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }).catch((err)=>{
                        console.log("error-",err)
                        resolve(false)
                    })

                } else{
                    resolve(true)
                }

            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log("erro",err)
            resolve(false)
        })
    })
}
const updateTaskInformation = (volunteer,taskId) =>{
    const condition = { TaskId: { [Op.eq]: `${taskId}`}};
    return new Promise((resolve)=>{
        taskMaster
            .update(
                { VolunteerId: volunteer },
                { where: condition }
            ).then((updateRes)=>{
                if(updateRes){
                    resolve(true)
                } else{
                    resolve(false)
                }
        }).catch((err)=>{
            resolve(false)
        })

    })

}

const getEventInformation = ()=>{
    return new Promise((resolve)=>{
        taskMaster.findAll({
            include: [
                {
                    model: eventMaster,
                },
                {
                    attributes:['FirstName','MiddleName','LastName','Mobile','Email'],
                    model: voterMaster,
                }
                ]
        }).then(async (res)=>{

            let tempArray = [];
            const taskEventArray =  loadash.groupBy(res, "EventId");
            let tempTaskEventArray = [];
            let tempIndex = 0
             await Object.entries(taskEventArray).forEach(async ([key, value]) => {
                 let tempObjForEvent = {}
                 let tempTaskArray = [];
                 let tempTotalTask = 0;
                 let tempCompletedTask = 0;
                value.map((item,index)=>{
                    if(index === 0){
                        tempObjForEvent =
                            {...tempObjForEvent,
                            EventId: item.dataValues.EventMaster.dataValues.EventId,
                            EventName: item.dataValues.EventMaster.dataValues.EventName,
                            Description:item.dataValues.EventMaster.dataValues.Description,
                            Address: item.dataValues.EventMaster.dataValues.Address,
                            Organiser: item.dataValues.EventMaster.dataValues.Organiser,
                            Guest: item.dataValues.EventMaster.dataValues.Guest,
                            EventDate:item.dataValues.EventMaster.dataValues.EventDate,
                            EventMaker: item.dataValues.EventMaster.dataValues.EventMaker,
                                TaskProgress : 0.1
                        }
                    }

                    tempTaskArray.push({
                        TaskId: item.dataValues.TaskId,
                        TaskName: item.dataValues.TaskName,
                        Description: item.dataValues.Description,
                        DeadlineDate: item.dataValues.DeadlineDate,
                        Status: item.dataValues.Status ==0 ? 'Pending':'complete',
                        VolunteerId: item.dataValues.VolunteerId,
                        VolunteerName: item.dataValues.VoterMaster!== null ?item.dataValues.VoterMaster.FirstName + " " + item.dataValues.VoterMaster.MiddleName:'',
                        VolunteerEmail: item.dataValues.VoterMaster!== null ?item.dataValues.VoterMaster.Email:'',
                        VolunteerMobile: item.dataValues.VoterMaster!== null ?item.dataValues.VoterMaster.Mobile:'',
                    })

                    tempTotalTask = tempTotalTask + 1;
                    if(item.dataValues.Status == 1){
                        tempCompletedTask = tempCompletedTask + 1;
                    }
                })
                 let tempProgressPercentage = 0
                 if(tempCompletedTask > 0){
                     tempProgressPercentage = (tempCompletedTask / tempTotalTask) *100;
                     tempProgressPercentage = tempProgressPercentage / 100;
                     tempProgressPercentage = tempProgressPercentage /2;
                 }
                 tempCompletedTask = 0;
                tempTotalTask = 0;
                tempObjForEvent = {...tempObjForEvent,TaskProgress: tempProgressPercentage}
                 tempTaskEventArray.push({eventData:tempObjForEvent,eventTask:tempTaskArray})
            });
            if(tempTaskEventArray.length>0){
                resolve(tempTaskEventArray)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err-",err)
            resolve(false)
        })
    })
}
const getEventInformationForDisplay = ()=>{
    return new Promise((resolve)=>{
        eventMaster.findAll({
            order: [["EventDate", "DESC"]],
        }).then(async (res)=>{

            let eventInformation = [];
            if(res){
                resolve(res)
                // await res.map((data)=>{
                //
                //     let temp = data.dataValues
                //     eventInformation.push({
                //         Description:temp.Description,
                //         Title:temp.EventName,
                //         MessageDate:moment(temp.EventDate).format("YYYY-MM-DD hh:mm:ss A"),
                //         // Images:temp.NotificationImage,
                //         // Pdf:temp.Attachments,
                //         Location:temp.Address,
                //         FromDate:moment(temp.EventDate).format("YYYY-MM-DD"),
                //         ToDate:moment(temp.NotificationDetail.dataValues.ToDate).format("YYYY-MM-DD"),
                //         StartTime:moment(temp.EventDate).format("hh:mm:ss A"),
                //         Organizer:temp.Organizer,
                //     })
                // })
            } else {
                resolve(false)
            }
            if(eventInformation.length>0){
                resolve(eventInformation)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err-",err)
            resolve(false)
        })
    })
}
const getTemplateList = () =>{
    return new Promise((resolve)=>{
        templateMaster.findAll().then((res)=>{
            if(res){
                resolve(res)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const addMemberTemplateToDb = (templateDetail) =>{
    return new Promise((resolve)=>{
        memberTemplateMaster.create(templateDetail).then((isCreated)=>{
            if(isCreated){
                resolve(true)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const getMemberTemplateList = (memberId) =>{
    const condition = { MemberID: { [Op.eq]: `${memberId}`}};
    return new Promise((resolve)=>{
        memberTemplateMaster.findAll({where:condition}).then((res)=>{
            if(res){
                resolve(res)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
module.exports = {getMemberTemplateList,addMemberTemplateToDb,getTemplateList,addNewEvent,getEventInformation,updateTaskInformation,getEventInformationForDisplay}
