const db = require("../models");
const loadash = require("lodash")
const moment = require("moment")
const {voterMasterRequest,addressMaster,occupationMaster,taskMaster,eventMaster,voterMaster,volunteer_booth,wardMaster,trustFactorMaster,familyMaster,nativePlaceMaster} = db
const {Op} = db.Sequelize
const {sequelize} = require("../config/sequlize")
const  {VOTER_ATTRIBUTES,DATABASE_NAME} = require("../handler/common/constants")
const  {isDefined,filterComparador,mapComparador} = require("../handler/common/commonMethods")
// const condition = { VoterId: { [Op.eq]: `${volunteerId}`},IsOurVolunteer: { [Op.eq]: '1'}};

const getVolunteerTask = (volunteerId) =>{
    return new Promise((resolve)=>{
        const condition = { VoterId: { [Op.eq]: `${volunteerId}`},IsOurVolunteer: { [Op.eq]: '1'}};
        taskMaster.findAll({
            include: [
                {
                    model: eventMaster,
                },
                {
                    attributes:['FirstName','LastName','Mobile','Email'],
                    model: voterMaster,
                    where:condition
                }
            ]
        }).then(async (res)=>{
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
                        VolunteerName: item.dataValues.VoterMaster!== null ?item.dataValues.VoterMaster.FirstName + " " + item.dataValues.VoterMaster.LastName:'',
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

const updateTaskInformation = (taskId,status) =>{
    const condition = { TaskId: { [Op.eq]: `${taskId}`}};
    return new Promise((resolve)=>{
        taskMaster
            .update(
                { Status: status },
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
const getVolunteerList = () =>{
    return new Promise((resolve)=>{
        const condition = { IsOurVolunteer: { [Op.eq]: '1'}};
        voterMaster.findAll({where:condition}).then((volunteerList)=>{
            if(volunteerList){
                resolve(volunteerList)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const getBoothForVolunteer = (volunteerId) =>{
    const condition = { VoterId: { [Op.eq]: volunteerId}};
    return new Promise((resolve)=>{
        return(
            volunteer_booth.findAll({include: [
                {
                    model: voterMaster,
                    where:condition,
                },
                    {
                        model:wardMaster ,
                    },
                ]}).then((res)=>{
                if(res){
                    resolve(res)
                } else {
                    resolve(false)
                }
            }).catch((err)=>{
                resolve(false)
            })
        )
    })
}
const getBoothDetailRemainingForVolunteer = (volunteerId) =>{
    const condition = { VolunteerId: { [Op.ne]: volunteerId}};
    let responseArray = []
    return new Promise((resolve)=>{
        return(
           sequelize.query("select * from "+DATABASE_NAME+".WardMaster where WardId  not in (select BoothId from "+DATABASE_NAME+".Volunteer_Booth where VolunteerId = "+volunteerId+")").then((res)=>{
               if(res){
                   resolve(res[0])
               } else {
                   resolve(false)
               }
           })
        )
    })
}
const updateVolunteerBoothStatus = (data) =>{
    return new Promise((resolve)=>{
        const condition = { VolunteerId: { [Op.eq]: data.volunteerId},BoothId: { [Op.eq]: data.wardId}};
        volunteer_booth.findOne({where:condition}).then((isAvilable)=>{
            console.log(isAvilable)
            if(isAvilable){
                volunteer_booth.destroy({where:condition}).then((isRemoved)=>{
                    if(isRemoved){
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    console.log("err",err)
                    resolve(false)
                })
            } else {
                let insObj = {
                    VolunteerId: data.volunteerId,
                    BoothId:data.wardId
                }
                volunteer_booth.create(insObj).then((isNewCreated)=>{
                    console.log(isNewCreated)
                    if(isNewCreated){
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    console.log(err)
                    resolve(false)
                })
            }
        }).catch((err)=>{
            console.log("errr--",err)
            resolve(false)
        })
    })
}

// let responseArray = [];
// sequelize.query("select * from community_db.VoterMaster where VoterId not in (SELECT VoterId From community_db.VoterMasterRequest where ByVolunteer="+volunteerId+")").then((voterReqData)=>{
//     if(voterReqData && voterReqData[0].length>0){
//         console.log(voterReqData[0])
//         var manipulatedArray = voterReqData[0].filter(filterComparador(res))
//             .map(mapComparador(res));
//
//         resolve(manipulatedArray)
//     } else {
//         resolve(res)
//     }
// }).catch((err)=>{
//     resolve(res)
// })


// const getBoothWiseVoterList = (boothId,volunteerId) =>{
//     return new Promise((resolve)=> {
//         sequelize.query("select * from community_db.VoterMaster where VoterId not in (SELECT VoterId From community_db.VoterMasterRequest where ByVolunteer="+volunteerId+")").then((voterReqData)=>{
//         if(voterReqData && voterReqData[0].length>0){
//             resolve(voterReqData[0])
//     } else {
//         resolve(false)
//     }
//     }).catch((err)=>{
//     resolve(false)
//     })
//     })
// }

const getBoothWiseVoterList = (boothId,volunteerId) =>{
    return new Promise((resolve)=>{
        const condition = { BoothId: { [Op.eq]: boothId}};
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
                  sequelize.query("select * from "+DATABASE_NAME+".VoterMaster where VoterId not in (SELECT VoterId From "+DATABASE_NAME+".VoterMasterRequest where ByVolunteer="+volunteerId+" and IsApproved=0)").then(async (voterReqData)=>{
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
const makeRequestToChangeVoterDetail = (volunteerId,voterData) => {
    return new Promise((resolve)=>{
        let insReqObj = {IsApproved:0,ByVolunteer:parseInt(volunteerId),VoterId:voterData.updatingVoterId,BoothId:voterData.boothId}

        if(isDefined(voterData.firstName)){
            insReqObj = {...insReqObj,FirstName:voterData.firstName}
        }
        if(isDefined(voterData.profileImage)){
            insReqObj = {...insReqObj,ProfileImage:voterData.profileImage}
        }
        if(isDefined(voterData.age)){
            insReqObj = {...insReqObj,Age:voterData.age}
        }
        if(isDefined(voterData.lastName)){
            insReqObj = {...insReqObj,MiddleName:voterData.lastName}
        }
        if(isDefined(voterData.email)){
            insReqObj = {...insReqObj,Email:voterData.email}
        }
        if(isDefined(voterData.mobile)){
            insReqObj = {...insReqObj,Mobile:voterData.mobile}
        }

        if(isDefined(voterData.dob)){
            insReqObj = {...insReqObj,DOB:voterData.dob}
        }
        if(isDefined(voterData.familyId)){
            insReqObj = {...insReqObj,FamilyId:voterData.familyId}
        }
        if(isDefined(voterData.voterId)){
            insReqObj = {...insReqObj,VoterVotingId:voterData.voterId}
        }

        if(isDefined(voterData.gender)){
            insReqObj = {...insReqObj,Gender:voterData.gender}
        }
        if(isDefined(voterData.isAlive)){
            insReqObj = {...insReqObj,isAlive:voterData.isAlive}
        }
        if(isDefined(voterData.influencer)){
            insReqObj = {...insReqObj,IsInfluencer:voterData.influencer}
        }
        if(isDefined(voterData.trustFactorId)){
            insReqObj = {...insReqObj,TrustFactorId:voterData.trustFactorId}
        }

        const condition = { VoterId: { [Op.eq]: `${voterData.updatingVoterId}`},ByVolunteer: { [Op.eq]: parseInt(volunteerId)}};
        voterMasterRequest.findOne({where:condition}).then(async (isRequestAlreadyCreated)=>{
            if(isRequestAlreadyCreated){
               await delete insReqObj.ByVolunteer
                voterMasterRequest
                    .update(
                     insReqObj,
                        { where: condition }
                    ).then((isRequestUpdated)=>{
                        if(isRequestUpdated){
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                }).catch((err)=>{
                    console.log("error--",err)
                    resolve(false)
                })

            } else {
                voterMasterRequest.create(insReqObj).then((isRequestCreated)=>{
                    console.log(isRequestCreated)
                    if(isRequestCreated){
                        resolve(true)
                    } else{
                        resolve(false)
                    }
                }).catch((err)=>{
                    console.log("error--",err)
                    resolve(false)
                })
            }
        }).catch((err)=>{
            resolve(false)
        })

    })
}
const getVolunteerChanges = (volunteerId) =>{
    return new Promise(async (resolve)=>{
        const condition = {ByVolunteer: { [Op.eq]: parseInt(volunteerId)},IsApproved: { [Op.eq]: 0}};
        await voterMasterRequest
            .findAll({
                attributes: VOTER_ATTRIBUTES,
                where: condition,
                order: [
                    [
                        sequelize.fn(
                            "concat",
                            sequelize.col("voterMasterRequest.FirstName"),
                            sequelize.col("voterMasterRequest.MiddleName"),
                            sequelize.col("voterMasterRequest.LastName")
                        ),
                        "ASC",
                    ],
                ],
                include: [
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "MotherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "FatherInLawDetail",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
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
                resolve(res)

            })
            .catch((err) => {
                console.log("error--",err)
                resolve(false)
            });
    })
}
const getAllVolunteerRequest = (volunteerId) =>{
    return new Promise(async (resolve)=>{
        const condition = {ByVolunteer: { [Op.eq]: parseInt(volunteerId)}};
        await voterMasterRequest
            .findAll({
                attributes: [...VOTER_ATTRIBUTES,"IsApproved"],
                where: condition,
                order: [
                    [
                        sequelize.fn(
                            "concat",
                            sequelize.col("voterMasterRequest.FirstName"),
                            sequelize.col("voterMasterRequest.MiddleName"),
                            sequelize.col("voterMasterRequest.LastName")
                        ),
                        "ASC",
                    ],
                ],
                include: [
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "MotherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
                        as: "FatherInLawDetail",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMasterRequest,
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
                resolve(res)

            })
            .catch((err) => {
                console.log("error--",err)
                resolve(false)
            });
    })
}
const implementVolunteerChangesToRealData = (data) =>{
    console.log("input--",data.voterData)
    return new Promise((resolve)=>{
        let condition = { VoterId: { [Op.eq]: `${data.voterData.VoterId}`}};
        voterMaster.update(data.voterData,{where:condition}).then((isUpdated)=>{
            if(isUpdated){
                condition = { VoterId: { [Op.eq]: `${data.voterData.VoterId}`},ByVolunteer: { [Op.eq]: parseInt(data.volunteerId)}};
                voterMasterRequest.update({IsApproved: 1},{where:condition}).then((isStatusUpdated)=>{
                    if(isStatusUpdated){
                        resolve(true)
                    } else {
                        resolve(true)
                    }
                }).catch((err)=>{
                    resolve(false)
                })
                resolve(true)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err--",err)
            resolve(false)
        })
        resolve(true)
    })
}

const implementVolunteerChangesToRealDataForAll = (data) =>{
    console.log("input--",data.voterData)
    return new Promise((resolve)=>{
        let condition = { VoterId: { [Op.eq]: `${data.voterData.VoterId}`}};
        voterMaster.update(data.voterData,{where:condition}).then((isUpdated)=>{
            if(isUpdated){
                resolve(true)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err--",err)
            resolve(false)
        })
    })
}
const acceptAllChangesToRealData = (data) =>{
    return new Promise(async (resolve)=>{
        let updateIndex = 0
        await data.dataArray.map(async (voterValue,index)=>{
            let condition = { VoterId: { [Op.eq]: `${voterValue.VoterId}`}};
            voterMaster.update(voterValue,{where:condition}).then((isUpdated)=>{
                updateIndex = updateIndex + 1;
                if(updateIndex >= data.dataArray.length){
                    let condition = { ByVolunteer: { [Op.eq]: parseInt(data.volunteerId)}};
                    voterMasterRequest.update({IsApproved: 1},{where:condition}).then((isStatusUpdated)=>{
                        if(isStatusUpdated){
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }).catch((err)=>{
                        resolve(false)
                    })
                }

            }).catch((err)=>{
                updateIndex = updateIndex + 1;
                if(updateIndex >= data.dataArray.length) {
                    resolve(false)
                }
                console.log("err--",err)
                // resolve(false)
            })


            // implementVolunteerChangesToRealDataForAll({voterData:voterValue}).then((res)=>{console.log("ress--",res)})
        })



    })
}
module.exports = {acceptAllChangesToRealData,getAllVolunteerRequest,implementVolunteerChangesToRealData,getVolunteerChanges,makeRequestToChangeVoterDetail,getBoothWiseVoterList,updateVolunteerBoothStatus,getBoothDetailRemainingForVolunteer,getBoothForVolunteer,getVolunteerTask,updateTaskInformation,getVolunteerList}
