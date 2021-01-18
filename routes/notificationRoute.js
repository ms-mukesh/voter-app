const express = require("express");
const Sequelize = require("sequelize");
const {decodeDataFromAccessToken} = require('../handler/utils')
const {isDefined,uniq} = require('../handler/common/commonMethods')
const {sequelize} = require("../config/sequlize")
const router = express.Router();
const db = require("../models");

const {NOTIFICATION_LIMIT} = require("../handler/common/constants")
const {notificationDetails,notificationTypeMaster,notificationMaster} = db
const {sendMultipleNotification,getUserNotificationForList} = require("../handler/notification")
const { Op } = db.Sequelize;
router.post(
    "/sendMultipleNotification",
    async (req, res, next) => {
        if (!req.body.msg) {
            return res
                .status(202)
                .send({ data: "Please provide proper message for notification" });
        }
        if (!req.body.notificationTitle) {
            return res
                .status(202)
                .send({ data: "Please provide Title for Notification" });
        }
        next();
    },
    async (req, res) => {
        try {
            const type = req.body.type || ["2"];
            const { msg, notificationTitle } = req.body;
            let { docUrl, imageUrl } = req.body;
            if (isDefined(imageUrl) && imageUrl === "") {
                imageUrl = "";
            } else if (isDefined(imageUrl) && imageUrl === []) {
                imageUrl = "";
            } else if (isDefined(imageUrl) && imageUrl.length === 0) {
                imageUrl = imageUrl[0];
            } else if (isDefined(imageUrl)) {
                let tempImage = "";
                imageUrl.map((item) => {
                    tempImage = `${item},${tempImage}`;
                });
                imageUrl = tempImage.substring(0, tempImage.length - 1);
            } else {
                imageUrl = "";
            }
            if (isDefined(docUrl) && docUrl === "") {
                docUrl = "";
            } else if (isDefined(docUrl) && docUrl === []) {
                docUrl = "";
            } else if (isDefined(docUrl) && docUrl.length === 0) {
                docUrl = docUrl[0];
            } else if (isDefined(docUrl)) {
                let tempDoc = "";
                docUrl.map((item) => {
                    tempDoc = `${item},${tempDoc}`;
                });
                docUrl = tempDoc.substring(0, tempDoc.length - 1);
            } else {
                docUrl = "";
            }
            let tokenData = "";

            await decodeDataFromAccessToken(req.headers.token).then((tokenRes) => {
                if (tokenRes) {
                    tokenData = tokenRes;
                }
            });
            const senderId = tokenData.voterId;
            console.log("reached--",senderId)
            let i = 0;
            sendMultipleNotification(
                imageUrl,
                msg,
                [],
                senderId,
                notificationTitle,
                req,
                docUrl,
                type
            )
            // eslint-disable-next-line no-unused-vars
                .then((response) => {
                    return res.status(200).send({ message: "Succesfully sent !" });
                })
                .catch((err) => {
                    res.status(202).send({
                        message: "oops! Some issue while sending notification",
                    });
                });
            // getDeviceIdByRole(type).then((deviceId) => {
            //     if (deviceId.length === 0) {
            //         sendMultipleNotification(
            //             imageUrl,
            //             msg,
            //             deviceId,
            //             senderId,
            //             notificationTitle,
            //             req,
            //             docUrl,
            //             type
            //         )
            //         // eslint-disable-next-line no-unused-vars
            //             .then((response) => {
            //                 return res.status(200).send({ message: "Succesfully sent !" });
            //             })
            //             .catch((err) => {
            //                 res.status(202).send({
            //                     message: "oops! Some issue while sending notification",
            //                 });
            //             });
            //     } else if (deviceId.length <= 500) {
            //         sendMultipleNotification(
            //             imageUrl,
            //             msg,
            //             deviceId,
            //             senderId,
            //             notificationTitle,
            //             req,
            //             docUrl,
            //             type
            //         )
            //         // eslint-disable-next-line no-unused-vars
            //             .then((response) => {
            //                 res.status(200).send({ message: "Succesfully sent !" });
            //             })
            //             // eslint-disable-next-line no-unused-vars
            //             .catch((err) => {
            //                 res.status(202).send({
            //                     message: "oops! Some issue while sending notification",
            //                 });
            //             });
            //     } else {
            //         const loopCount = Math.ceil(deviceId.length / 500);
            //         let startIndex = 0;
            //         let endIndex = 500;
            //         let temp = 0;
            //         for (i = 0; i < loopCount; i++) {
            //             sendMultipleNotification(
            //                 imageUrl,
            //                 msg,
            //                 deviceId.slice(startIndex, endIndex),
            //                 senderId,
            //                 notificationTitle,
            //                 req,
            //                 docUrl,
            //                 type
            //             )
            //                 .then((response) => {
            //                     // console.log(JSON.stringify(response));
            //                 })
            //                 .catch((err) => {
            //                     console.log(JSON.stringify(err));
            //                 });
            //
            //             temp = deviceId.length - 500;
            //             startIndex = endIndex;
            //             if (temp >= 500) {
            //                 endIndex += 500;
            //             } else {
            //                 endIndex = temp;
            //             }
            //         }
            //         res.send({ message: "Succesfully send" });
            //     }
            // });
        } catch (ex) {
            res.status(500).send(ex);
        }
    }
);

router.post(
    "/getUserNotificationList",
    (request, response, next) => {
        if (
            typeof request.query.page !== "undefined" &&
            isNaN(request.query.page)
        ) {
            response.status(202).send({ data: "data not found" });
        }
        next();
    },
    async (request, response) => {
        try {
            let tokenData = "";
            await decodeDataFromAccessToken(request.headers.token).then((res) => {
                if (res) {
                    tokenData = res;
                }
            });
            if (tokenData) {
                const { voterId } = tokenData;
                const { typeId } = request.body;
                let offset = 0;
                let page = 0;
                if (typeof request.query.page !== "undefined") {
                    if (parseInt(request.query.page) === 0) {
                        offset = 0;
                        page = 0;
                    } else if (parseInt(request.query.page) > 0) {
                        // eslint-disable-next-line radix
                        offset = (parseInt(request.query.page) - 1) * NOTIFICATION_LIMIT;
                        // eslint-disable-next-line no-unused-vars
                        page = request.query.page;
                    } else if (parseInt(request.query.page) === -1) {
                        offset = -1;
                        page = 0;
                    }
                }
                await getUserNotificationForList(typeId, offset, voterId).then(
                    async (notifications) => {
                        if (notifications) {
                            const memberNotification = [];
                            await notifications.data.map(async (notificationData) => {
                                const notification = notificationData.dataValues;
                                let receivers = notification.Receivers;
                                let unReadFlag = notification.UnReadFlag;
                                unReadFlag = unReadFlag.split(",");
                                receivers = receivers.split(",");
                                receivers = uniq(receivers);
                                let tempResObj = "";
                                // console.log(notification);
                                // console.log(receivers)
                                // console.log(memberId)
                                // console.log(receivers.indexOf(memberId.toString()))
                                if (receivers.indexOf(voterId.toString()) > -1) {
                                    tempResObj = {
                                        NotificationId: notification.NotificationId,
                                        Description: notification.Description,
                                        Title: notification.Title,
                                        DateTime: notification.DateTime,
                                        NotificationType: notification.TypeId,
                                        UniqueNotificationId: notification.UniqueNotificationId,
                                    };
                                    if (notification.News !== null) {
                                        tempResObj = {
                                            ...tempResObj,
                                            NewsEvent: notification.News,
                                        };
                                    }
                                    if (unReadFlag.indexOf(voterId.toString()) > -1) {
                                        tempResObj = { ...tempResObj, UnReadFlag: true };
                                    } else {
                                        tempResObj = { ...tempResObj, UnReadFlag: false };
                                    }
                                    if (
                                        notification.NotificationImage !== "" &&
                                        notification.NotificationImage !== "NA"
                                    ) {
                                        tempResObj = {
                                            ...tempResObj,
                                            ImgPath: notification.NotificationImage.split(","),
                                        };
                                    }
                                    if (
                                        notification.Attachments !== "" &&
                                        notification.Attachments !== "NA"
                                    ) {
                                        tempResObj = {
                                            ...tempResObj,
                                            DocPath: notification.Attachments.split(","),
                                        };
                                    }
                                    if (notification.NotificationDetailId !== null) {
                                        const tempDetail = notification.NotificationDetail;
                                        if (tempDetail.Location !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                Locations: tempDetail.Location,
                                            };
                                        }
                                        if (tempDetail.FromDate !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                FromDate: tempDetail.FromDate,
                                            };
                                        }
                                        if (tempDetail.ToDate !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                ToDate: tempDetail.ToDate,
                                            };
                                        }
                                        if (tempDetail.Cause !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                Cause: tempDetail.Cause,
                                            };
                                        }
                                        if (tempDetail.MinLimit !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                MinLimit: tempDetail.MinLimit,
                                            };
                                        }
                                        if (tempDetail.MaxLimit !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                MaxLimit: tempDetail.MaxLimit,
                                            };
                                        }

                                        if (tempDetail.CloseDate !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                CloseDate: tempDetail.CloseDate,
                                            };
                                        }
                                        if (tempDetail.Organizer !== null) {
                                            tempResObj = {
                                                ...tempResObj,
                                                Organizer: tempDetail.Organizer,
                                            };
                                        }
                                        if (tempDetail.NewsType !== null) {
                                            let tempNewsType = "Good News";
                                            if (parseInt(tempDetail.NewsType) === 0) {
                                                tempNewsType = "Bad News";
                                            } else if (parseInt(tempDetail.NewsType) === 2) {
                                                tempNewsType = "Information";
                                            }
                                            tempResObj = {
                                                ...tempResObj,
                                                NewsType: tempNewsType,
                                            };
                                        }
                                    }
                                    memberNotification.push(tempResObj);
                                    // console.log(tempResObj)
                                }
                            });

                            if (memberNotification.length !== 0) {
                                return response.status(200).send({
                                    data: memberNotification,
                                    next_endpoint: notifications.next_endpoint,
                                });
                            }
                            return response
                                .status(202)
                                .send({ data: "No New Notifications" });
                        }
                        return response.status(202).send({ data: "No New Notifications" });
                    }
                );
            } else {
                return response.status(202).send({ data: "No New Notifications" });
            }
        } catch (ex) {
            response.status(500).send(ex);
        }
    }
);

module.exports = router
