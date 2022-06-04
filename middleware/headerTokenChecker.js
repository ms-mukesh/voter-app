const express = require("express");
const { decodeDataFromAccessToken } = require("../handler/utils");
const db = require("../models/index");
const { voterMaster } = db;
const { Op } = db.Sequelize;
const app = express();

app.use(async (request, response, next) => {
  if (request.headers.token) {
    decodeDataFromAccessToken(request.headers.token).then(async (res) => {
      if (res) {
        const tokenData = res;
        const condition = { VoterId: { [Op.eq]: `${tokenData.voterId}` } };
        const member = await voterMaster.findAll({
          where: condition,
          attributes: ["MemberToken"],
        });
        const memberData = member[0].dataValues;
        console.log(memberData)
        if (
          memberData.length === 0 ||
          memberData.MemberToken === "" ||
          memberData.MemberToken === null
        ) {

          return response.status(200).send({
            data: "Not Authorized Member",
            errCode: 401,
            errMessage: "Oops! May be you are not authorized with App.",
          });
        }
        if (memberData.MemberToken ===request.headers.token) {
          next();
        } else {
          return response.status(200).send({
            data: "Not Authorized Member",
            errCode: 401,
            errMessage: "Oops! May be you are not authorized with  App.",
          });
        }
      } else {
        return response.status(200).send({
          data: "Not Authorized Member",
          errCode: 401,
          errMessage: "Oops! May be you are not authorized with  App.",
        });
      }
    });
  } else {
    return response.status(200).send({
      data: "Not Authorized Member",
      errCode: 401,
      errMessage: "Oops! May be you are not authorized with  App.",
    });
  }
});
module.exports = app;
