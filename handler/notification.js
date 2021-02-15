const {getAllFemaleMemberId,getAllMaleMemberId,getAllVolunteerMemberId,isDefined,getTypeIdFromName,getAllMemberId,getAllHeadMemberId,getAdminMemberId} = require('../handler/common/commonMethods')
const {ALL_RECEIVER_FEMALE,ALL_RECEIVER_MALE,VOLUNTEER_RECEIVER,ADMIN_RECEIVER,HEAD_RECEIVER,ALL_RECEIVER,NOTIFICATION_LIMIT} = require('../handler/common/constants')
const {notificationMaster,notificationTypeMaster,notificationDetails} = require("../models")
const db = require("../models/")
const { Op } = db.Sequelize;

const pageLimit = NOTIFICATION_LIMIT;
const addNotificationToTable = async (notificationData) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        await notificationMaster
            .create(notificationData)
            .then((data) => {
                if (data) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(false);
            });
    });
};
const addNotificationDetails = (notificationDetailObj) => {
    return new Promise((resolve) => {
        notificationDetails.create(notificationDetailObj).then((insRes) => {
            if (insRes) {
                return resolve(insRes.dataValues.NotificationDetailId);
            }
            return resolve(false);
        });
    });
};
const sendMultipleNotification = async (
    img,
    msg,
    tokens,
    senderId,
    notificationTitle = notificationTitleStatic,
    request,
    doc = null,
    receiverType
) => {
    // notification limit = 500
    // let image = img;
    const tempTokenArray = [];
    let tempNotificationData = "";
    let imgPathForDatabse = "";
    let docPathForDatabse = "";
    let notficationDetailObj = "";
    let notificationImage = "";
    let typeId = "1";
    let notificationTitleToSend = "";
    let notificationMsgToSend = "";
    request = request.body;

    // eslint-disable-next-line array-callback-return
    console.log(receiverType);
    // receiverType = receiverType.split(",");
    // console.log(receiverType);
    const receiveArray = [];

    if (receiverType.includes(ADMIN_RECEIVER)) {
        await getAdminMemberId().then((res) => {
            if (res) {
                res.map((item) => {
                    console.log(item)
                    if (receiveArray.indexOf(item.dataValues.AdminId) < 0) {
                        receiveArray.push(item.dataValues.AdminId);
                    }
                });
                console.log(receiveArray)
            }
        });
    }
    if (receiverType.includes(VOLUNTEER_RECEIVER)) {
        await getAllVolunteerMemberId().then((res) => {
            if (res) {
                res.map((item) => {
                    if (receiveArray.indexOf(item.dataValues.VoterId) < 0) {
                        receiveArray.push(item.dataValues.VoterId);
                    }
                });
            }

        });
    }
    if (receiverType.includes(ALL_RECEIVER)) {
        await getAllMemberId().then((res) => {
            if (res) {
                res.map((item) => {
                    if (receiveArray.indexOf(item.dataValues.VoterId) < 0) {
                        receiveArray.push(item.dataValues.VoterId);
                    }
                });
                console.log(receiveArray)
            }
        });
    }
    if (receiverType.includes(ALL_RECEIVER_MALE)) {
        await getAllMaleMemberId().then((res) => {
            if (res) {
                res.map((item) => {
                    if (receiveArray.indexOf(item.dataValues.VoterId) < 0) {
                        receiveArray.push(item.dataValues.VoterId);
                    }
                });
                console.log(receiveArray)
            }
        });
    }
    if (receiverType.includes(ALL_RECEIVER_FEMALE)) {
        await getAllFemaleMemberId().then((res) => {
            if (res) {
                res.map((item) => {
                    if (receiveArray.indexOf(item.dataValues.VoterId) < 0) {
                        receiveArray.push(item.dataValues.VoterId);
                    }
                });
                console.log(receiveArray)
            }
        });
    }

       return new Promise(async (resolve, reject) => {
        if (msg) {
            if (img === "" || img === null || typeof img === "undefined") {
                imgPathForDatabse = "NA";
            } else {
                notificationImage = img.substring(0, img.indexOf(","));
                imgPathForDatabse = img;
            }
            if (doc === "" || doc === null || typeof doc === "undefined") {
                docPathForDatabse = "NA";
            } else {
                docPathForDatabse = doc;
            }
            if (isDefined(request.location)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    Location: request.location,
                };
            }
            if (isDefined(request.fromDate)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    FromDate: request.fromDate,
                };
            }
            if (isDefined(request.toDate)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    ToDate: request.toDate,
                };
            }
            if (isDefined(request.cause)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    Cause: request.cause,
                };
            }
            if (isDefined(request.minLimit)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    MinLimit: request.minLimit,
                };
            }
            if (isDefined(request.maxLimit)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    MaxLimit: request.maxLimit,
                };
            }
            if (isDefined(request.closeDate)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    CloseDate: request.closeDate,
                };
            }
            if (isDefined(request.organizer)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    Organizer: request.organizer,
                };
            }
            if (isDefined(request.newsType)) {
                notficationDetailObj = {
                    ...notficationDetailObj,
                    NewsType: request.newsType,
                };
            }
            if (isDefined(request.typeName)) {
                await getTypeIdFromName(request.typeName).then((resTypeID) => {
                    typeId = resTypeID;
                });
            }
            if (notificationTitle.length > 100) {
                notificationTitleToSend = notificationTitle.substring(0, 100);
            } else {
                notificationTitleToSend = notificationTitle;
            }

            if (msg.length > 500) {
                notificationMsgToSend = msg.substring(0, 500);
            } else {
                notificationMsgToSend = msg;
            }
            const uniqNotificationId = new Date().getTime();
            const receivers = receiveArray.join();
            const dateTime = new Date().getTime().toString();
                if (receivers.length > 0) {
                    tempNotificationData = {
                        Description: msg,
                        Title: notificationTitle,
                        NotificationImage: imgPathForDatabse,
                        Sender: senderId,
                        Receivers: receivers,
                        TypeId: 1,
                        DateTime: dateTime,
                        AllReceivers: receivers,
                        Attachments: docPathForDatabse,
                        UnReadFlag: receivers,
                        UniqueNotificationId: uniqNotificationId,
                    };
                    if (isDefined(request.news)) {
                        tempNotificationData = {
                            ...tempNotificationData,
                            News: request.news,
                        };
                    }
                    await getTypeIdFromName(request.typeName).then(async (res) => {
                        if (res) {
                            tempNotificationData = {
                                ...tempNotificationData,
                                TypeId: res,
                            };
                        }
                    });
                    if (notficationDetailObj) {
                        await addNotificationDetails(notficationDetailObj).then((res) => {
                            tempNotificationData = {
                                ...tempNotificationData,
                                NotificationDetailId: res,
                            };
                        });
                    }
                    await addNotificationToTable(tempNotificationData).then(() => {});
                    resolve(true);
                }

        } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject("Messaging Payload contains invalid value");
        }
    });
};

const getUserNotificationForList = async (typeId, offset, memberId) => {
    return new Promise(async (resolve) => {
        let condition = "";
        if (typeId !== "ALL") {
            condition = {
                TypeId: { [Op.eq]: `${typeId}` },
                AllReceivers: { [Op.like]: `%${memberId}%` },
            };
        } else {
            condition = {
                AllReceivers: { [Op.like]: `%${memberId}%` },
            };
        }
        await notificationMaster
            .findAll({
                offset: offset + pageLimit,
                limit: pageLimit,
                attributes: ["NotificationId"],
                where: condition,
            })
            .then((res) => {
                if (res.length > 0) {
                    nextUrl = `?page=${offset / pageLimit + 2}`;
                } else {
                    nextUrl = null;
                }
            });
        const notifications = await notificationMaster.findAll({
            where: condition,
            include: [
                {
                    model: notificationDetails,
                },
            ],
            offset,
            limit: pageLimit,
            order: [["DateTime", "DESC"]],
        });
        if (notifications.length > 0) {
            return resolve({ data: notifications, next_endpoint: nextUrl });
        }
        return resolve(false);
    });
};
module.exports={
    sendMultipleNotification,
    getUserNotificationForList
}
