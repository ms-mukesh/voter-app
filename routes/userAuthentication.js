const express = require("express");
const db = require("../models");
const router = express.Router();
const { Op } = db.Sequelize;
const {voterMaster, voter_list_master} = db
const {addTokenToTable,generateAccessToken,removeToken,decodeDataFromAccessToken} = require('../handler/utils')
const {NETWORK_FAILED_MESSAGE, DATABASE_NAME } = require('../handler/common/constants')
const {changeUserPassword, addVoterDetailsToVoterList } = require("../handler/voterData")
const {getUserRole} = require("../handler/common/commonMethods")
const { sequelize } = require("../config/sequlize");
router.post(
    "/changePassword",
    function (request, response, next) {
        if (!request.body.oldPwd) {
            return response.status(201).send({ data: "Please Provide Old Password" });
        }
        if (!request.body.newPwd) {
            return response.status(201).send({ data: "Please Provide New Password" });
        }
        next();
    },
    async function (request, response) {
        try {
            const req = request.body;
            const { oldPwd, newPwd } = req;
            let tokenData = null;
            await decodeDataFromAccessToken(request.headers.token).then((res) => {
                if (res) {
                    tokenData = res;
                }
            });
            if (tokenData !== null) {
                changeUserPassword(
                    tokenData.voterId,
                    oldPwd,
                    newPwd,
                    request.headers.token
                ).then((pwdUpdateStatus) => {
                    if (pwdUpdateStatus.status) {
                        return response.status(200).send({
                            data: pwdUpdateStatus.message,
                            status: pwdUpdateStatus.status,
                        });
                    }
                    return response.status(200).send({
                        data: pwdUpdateStatus.message,
                        status: pwdUpdateStatus.status,
                    });
                });
            } else {
                return response.status(201).send({ data: "Data Not Found" });
            }
        } catch (e) {
            response.json({ data: e.toString() });
        }
    }
);

router.post(
    "/memberLogin",
    (request, response, next) => {
        if (!request.body.email)
            return response
                .status(401)
                .send({ data: "please provide valid login id" });
        else if(!request.body.password)
            return response
                .status(401)
                .send({ data: "please provide valid login password" });
        next();
    },
    async function (request, response) {
        const req = request.body;
        try {
            const { email,password } = req;
            const condition = { email: { [Op.eq]: `${email}` },password:{ [Op.eq]: `${password}` }};
            const member = await voterMaster.findAll({
                where: condition,
                attributes: [
                    "VoterId",
                    "FirstName",
                    "MiddleName",
                    "LastName",
                    "DOB",
                    "ProfileImage",
                    "Email",
                    "Gender",
                ],
            }).catch((err)=>{
                console.log("error--",err)
            });
            if (member.length === 0) {
                return response.status(201).send({ data: "Invalid Login Details" });
            }
            const payLoadDataForAccessToken = {
                voterId : member[0].dataValues.VoterId,
                mailId : email
            }

            generateAccessToken(payLoadDataForAccessToken).then((accessToken)=>{
                if(accessToken){
                    let dataForResponse = {
                        voterId:member[0].dataValues.VoterId,
                        name : member[0].dataValues.FirstName + " "+member[0].dataValues.MiddleName ,
                        gender : member[0].dataValues.Gender,
                        profileImage : member[0].dataValues.ProfileImage,
                        accessToken : accessToken,
                        role:"NORMAL"
                    }
                    addTokenToTable(member[0].dataValues.VoterId,accessToken).then(async (addtoken)=>{
                        if(addtoken){
                             getUserRole(member[0].dataValues.VoterId).then((role)=>{
                                if(role){
                                    dataForResponse = {...dataForResponse,role:role}
                                    console.log(dataForResponse)
                                    return response.status(200).send({ data: dataForResponse });
                                } else {
                                    return response.status(200).send({ data: dataForResponse });
                                }
                            }).catch((err)=>{
                                 return response.status(200).send({ data: dataForResponse });
                             })
                        } else{
                            return response.status(201).send({ data: NETWORK_FAILED_MESSAGE });
                        }
                    })
                } else {
                    return response.status(201).send({ data: NETWORK_FAILED_MESSAGE });
                }
            })

            // return response.status(200).send({ data: member });
        } catch (ex) {
            response.status(500).send(ex);
        }
    }
);
router.post(
    "/memberLogin/v2/",
    (request, response, next) => {
        if (!request.body.email)
            return response
                .status(401)
                .send({ data: "please provide valid login id" });
        else if(!request.body.password)
            return response
                .status(401)
                .send({ data: "please provide valid login password" });
        next();
    },
    async function (request, response) {
        const req = request.body;
        try {
            const { email,password } = req;
            const condition = { email: { [Op.eq]: `${email}` },password:{ [Op.eq]: `${password}` }};
            console.log(condition)
            const member = await voter_list_master.findAll({
                where: condition,
                attributes: [
                    "voterUniqueId",
                    "voterName",
                    "dob",
                    "email",
                    "password",
                   "gender",
                  "voterType"
                ],
            }).catch((err)=>{
                console.log("error--",err)
                return response.status(201).send({ data: "Invalid Login Details" });
            });
            console.log(member.length)
            if (member.length === 0) {
                return response.status(201).send({ data: "Invalid Login Details" });
            }
            const payLoadDataForAccessToken = {
                voterId : member[0].dataValues.voterUniqueId,
                mailId : email
            }
            console.log(payLoadDataForAccessToken)

            generateAccessToken(payLoadDataForAccessToken).then((accessToken)=>{
                if(accessToken){
                    let dataForResponse = {
                        voterId:member[0].dataValues.voterUniqueId,
                        name : member[0].dataValues.voterName,
                        gender : member[0].dataValues.gender,
                        accessToken : accessToken,
                        role:member[0].dataValues.voterType
                    }
                    addTokenToTable(member[0].dataValues.voterUniqueId,accessToken).then(async (addtoken)=>{
                        if(addtoken){
                            return response.status(200).send({ data: dataForResponse });
                        } else{
                            return response.status(201).send({ data: NETWORK_FAILED_MESSAGE });
                        }
                    })
                } else {
                    return response.status(201).send({ data: NETWORK_FAILED_MESSAGE });
                }
            })

            // return response.status(200).send({ data: member });
        } catch (ex) {
            response.status(500).send(ex);
        }
    }
);
router.post("/signupUserV2", async (request, response) => {
    const req = request.body;
    console.log(req)
    const qry = "SELECT * FROM "+DATABASE_NAME+".VoterListMaster where email LIKE '%"+req.email+"%'"
    const checkDataRes = await sequelize.query(qry)
    if(checkDataRes){
        if(checkDataRes[0].length>0){
            return  response.status(201).send({ data: "This email is already register with us" });
        } else {
            const addDetailsMethodRes = await addVoterDetailsToVoterList(req);
            if(addDetailsMethodRes){
                return response.status(200).send({ data: 'Data added!' });
            }else {
                return  response.status(201).send({ data: "Failed to add data, please try again" });
            }
        }
    }else {
        return  response.status(201).send({ data: "Failed to add data, please try again" });

    }
});

router.post(
    "/forceLogout",
    function (request, response, next) {
        if (!request.body.deviceId) {
            return response.status(200).send({ data: "not found" });
        }
        if (!request.headers.token) {
            return response.status(200).send({ data: "not found" });
        }
        next();
    },
    async function (request, response) {
        try {
            const { deviceId } = request.body;
            let tokenData = "";
            await decodeDataFromToken(request.headers.token).then((res) => {
                if (res) {
                    tokenData = res;
                }
            });
            await removeTokenFromLogMaster(request.headers.token).then((res) => {});
            const condition = { MemberId: { [Op.eq]: `${tokenData.memberId}` } };
            const deviceCondition = {
                MemberId: { [Op.eq]: `${tokenData.memberId}` },
                DeviceId: { [Op.eq]: `${deviceId}` },
            };
            const deviceData = await memberDevice.findAll({ where: deviceCondition });
            if (deviceData.length !== 0) {
                await memberDevice
                    .destroy({ where: deviceCondition })
                    .then(() => {
                        // return response.status(200).send({ data: "Log out" });
                    })
                    .catch(() => {
                        // return response.status(200).send({ data: "Data Not Found" });
                    });
            } else {
                // return response.status(200).send({ data: "Data Not Found" });
            }
            const member = await memberMaster.findAll({ where: condition });

            if (member.length === 0) {
                return response.status(200).send({ data: "Data Not Found" });
            }
            if (member[0].dataValues.MemberToken.length > 0) {
                const tokens = member[0].dataValues.MemberToken;
                let tempTokens = [];
                if (tokens.indexOf(",") > -1) {
                    tempTokens = tokens.split(",");
                } else {
                    tempTokens.push(tokens);
                }
                // tokens = tokens.split(",");
                if (tempTokens.length === 1) {
                    memberMaster
                        .update(
                            { MemberToken: "" },
                            { where: { MemberId: tokenData.memberId } }
                        )
                        .then((updateRes) => {
                            if (updateRes) {
                                return response
                                    .status(200)
                                    .send({ data: "Updated Token Succesfully" });
                            }
                            return response
                                .status(200)
                                .send({ data: "Session Id Not Found" });
                        })
                        .catch(() => {
                            return response
                                .status(200)
                                .send({ data: "Failed To Fetch Your Session Id" });
                        });
                } else {
                    const index = tempTokens.indexOf(request.headers.token);
                    if (index > -1) {
                        let updatedToken = "";
                        tempTokens.splice(index, 1);
                        if (tempTokens.length === 1) {
                            updatedToken = tempTokens[0];
                        } else {
                            tempTokens.map((token) => {
                                updatedToken = `${token},${updatedToken}`;
                            });
                            updatedToken = updatedToken.substring(0, updatedToken.length - 1);
                        }
                        console.log(`updated Token${updatedToken}`);

                        memberMaster
                            .update(
                                { MemberToken: updatedToken },
                                { where: { MemberId: { [Op.eq]: `${tokenData.memberId}` } } }
                            )
                            .then((updateRes) => {
                                if (updateRes) {
                                    return response
                                        .status(200)
                                        .send({ data: "Updated Token Succesfully" });
                                }
                                return response
                                    .status(200)
                                    .send({ data: "Something wrong with Remove Token" });
                            })
                            .catch(() => {
                                return response
                                    .status(200)
                                    .send({ data: "Something wrong with Remove Token" });
                            });
                    } else {
                        return response.status(200).send({ data: "Data not found" });
                    }
                }
            } else {
                return response.status(200).send({ data: "Data Not Found" });
            }
        } catch (e) {
            response.json({ responseData: e.toString() });
        }
    }
);

router.get("/logout", (req,res,next)=>{
    if(!req.headers.token){
        return res
            .status(200)
            .send({ data: "Failed to Log out" });
    }
    next()
},(req, res) => {
    removeToken(req.headers.token).then((isUserLogout)=>{
        if(isUserLogout){
            return res
                .status(200)
                .send({ data: "Updated Token Succesfully !" });
        } else {
            return res
                .status(200)
                .send({ data: "Failed to Log out" });
        }
    }).catch((err)=>{
        return res
            .status(200)
            .send({ data: "Failed to Log out" });
    })

});


router.get("/", (req, res) => {
    res.json("hello");
});

module.exports = router;
