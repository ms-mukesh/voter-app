const db=require("../models")
const {voterMaster} = db
const {JWT_PRIVATE_KEY} = require("./common/constants")
const jwt = require("jsonwebtoken");
const generateAccessToken = (payloadData) => {
    return new Promise((resolve) => {
        const token = jwt.sign(payloadData, JWT_PRIVATE_KEY);
        return resolve(token);
    });
}
const {Op} = db.Sequelize
const decodeDataFromAccessToken = (token) => {
    return new Promise((resolve) => {
        let tokenData = "";
        // eslint-disable-next-line consistent-return
        jwt.verify(token, JWT_PRIVATE_KEY, function (err, decoded) {
            if (err) {
                return resolve(false);
            }
            tokenData = decoded;
            return resolve(tokenData);
        });
    });
};
const addTokenToTable = (voterId,accessToken) => {
    return new Promise((resolve)=>{
        voterMaster
            .update(
                { MemberToken: accessToken},
                { where: { VoterId: voterId } }
            )
            .then((updateRes) => {
                if (updateRes) {
                    return resolve(true);
                }
                return resolve(false);
            })
            .catch(() => {
                return resolve(false);
            });

    })
}
const removeToken = async (token) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars,consistent-return
    return new Promise(async (resolve, reject) => {
        let tokenData = "";
        await decodeDataFromAccessToken(token).then((res) => {
            if (res) {
                tokenData = res;
            } else {
                return resolve(false);
            }
        });

        const condition = { VoterId: { [Op.eq]: `${tokenData.voterId}` } };
        const member = await voterMaster.findAll({ where: condition });
        if (member.length === 0) {
            return resolve(false);
        }
        if (member[0].dataValues.MemberToken.length > 0) {
            let tokens = member[0].dataValues.MemberToken;
            tokens = tokens.split(",");
            if (tokens.length === 1) {
                voterMaster
                    .update(
                        { MemberToken: "" },
                        { where: { VoterId: tokenData.voterId } }
                    )
                    .then((updateRes) => {
                        if (updateRes) {
                            return resolve(true);
                        }
                        return resolve(false);
                    })
                    .catch(() => {
                        return resolve(false);
                    });
            } else {
                const index = tokens.indexOf(token);
                if (index > -1) {
                    let updatedToken = "";
                    tokens.splice(index, 1);
                    if (tokens.length === 1) {
                        // eslint-disable-next-line prefer-destructuring
                        updatedToken = tokens[0];
                    } else {
                        // eslint-disable-next-line array-callback-return,no-shadow
                        tokens.map((token) => {
                            updatedToken = `${token},${updatedToken}`;
                        });
                    }
                    updatedToken = updatedToken.substring(0, updatedToken.length - 1);
                    voterMaster
                        .update(
                            { MemberToken: updatedToken },
                            { where: { VoterId: { [Op.eq]: `${tokenData.voterId}` } } }
                        )
                        .then((updateRes) => {
                            if (updateRes) {
                                return resolve(true);
                            }
                            return resolve(false);
                        })
                        .catch(() => {
                            return resolve(false);
                        });
                } else {
                    return resolve(false);
                }
            }
        } else {
            return resolve(false);
        }
    });
};
module.exports={
    addTokenToTable,
    generateAccessToken,
    decodeDataFromAccessToken,
    removeToken
}
