const loadash = require("lodash")
const moment = require("moment")
const http = require("https")
const fs = require("fs");

const {
    PAGE_LIMIT,
    monthArray,
    VOTER_ATTRIBUTES,
    DATABASE_NAME
} = require("./common/constants");
const {getMonthFromString,isDefined,checkForValue,checkForValueForUpdate,getIdFromTable,updateTableValue} = require("./common/commonMethods")
const { fromPath } = require("pdf2pic")
const uuid = require("uuid-v4");
const { Storage } = require("@google-cloud/storage");
// eslint-disable-next-line import/order


const storage = new Storage({
    projectId: "textrecognize-e0630",
    keyFilename:
        "firebase/textrecognize-e0630-firebase-adminsdk-1tne5-234f3a146d.json",
});

let nextUrl = "";
let pageLimit = PAGE_LIMIT;
const db = require("../models");

const { sequelize } = require("../config/sequlize");

const { Op } = db.Sequelize;
const {
  voterMaster,
    familyMaster,
    nativePlaceMaster,
    addressMaster,
    occupationMaster,
    trustFactorMaster,
    castMaster,
    notificationDetails,
    notificationTypeMaster,
    notificationMaster,
    familyRoleMaster,
    wardMaster,
    digitalMasterCategory,
    templateMaster,
    election_voter,
    electionMaster,
    volunteer_election
} = db;

let lastPage = 0;
let totalMembers = 0;
// const tempArray=[
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
//     {"VoterVotingId":"","FirstName":"","MiddleName":"","Relation":"","Age":"","Gender":"","RoomNo":"","Address":""}
// ]
const tempArray=[
    {"VoterVotingId":"RJ/25/194/078352","FirstName":"Brijmohan","MiddleName":"Ratanlal","Relation":"Father","Age":"48","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
    {"VoterVotingId":"MTW1184191","FirstName":"Pawan","MiddleName":"Brijmohan","Relation":"Husband","Age":"50","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
    {"VoterVotingId":"ABZBO917542","FirstName":"Vinod","MiddleName":"Omprakash","Relation":"Father","Age":"41","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
    {"VoterVotingId":"AZB0917534","FirstName":"Munni Devi","MiddleName":"Vinod","Relation":"Husband","Age":"38","Gender":"Female","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
    {"VoterVotingId":"AZB0800276","FirstName":"Sugani Devi","MiddleName":"Omprakash","Relation":"Husband","Age":"70","Gender":"Female","RoomNo":"2","Address":"Bus stand, Khatukhurd"},
    {"VoterVotingId":"RJ/25/194/078525","FirstName":"Sundar","MiddleName":"Bheruram","Relation":"Husband","Age":"81","Gender":"Female","RoomNo":"2","Address":"Bus stand, Khatukhurd"}
]

const filterData = async (searchKey, sortingCrieteria = null) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars
    return new Promise(async (resolve, reject) => {
        let tempMemberArray = [];
        const dob = "";
        let memberMasterCondition = {
            MiddleName: { [Op.ne]: null },
            FirstName: { [Op.ne]: null },
        };
        console.log(searchKey)
        let addressMasterCondition = "";
        let nativePlaceCondition = "";
        let castMasterCondition = "";
        let trustMasterCondition = "";
        let boothMasterCondition = "";
        const condArray = [];
        const tempSortingCrieteriaArray = [];
        const sortingCrieteriaArray = [];
        let tempValue = null;
        let tempSortingOrder = null;
        if (sortingCrieteria !== null) {
            if (isDefined(sortingCrieteria.FirstName)) {
                tempValue = sortingCrieteria.FirstName;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: ["FirstName", tempSortingOrder],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });
            }
            if (isDefined(sortingCrieteria.MiddleName)) {
                tempValue = sortingCrieteria.MiddleName;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: ["MiddleName", tempSortingOrder],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });
                // tempSortingCrieteriaArray.push(["MiddleName", sortingOrder]);
            }
            if (isDefined(sortingCrieteria.LastName)) {
                tempValue = sortingCrieteria.LastName;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: ["LastName", tempSortingOrder],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });

                // tempSortingCrieteriaArray.push(["LastName", sortingOrder]);
            }
            if (isDefined(sortingCrieteria.MaritalStatus)) {
                tempValue = sortingCrieteria.MaritalStatus;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: ["MaritalStatus", tempSortingOrder],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });
                // tempSortingCrieteriaArray.push(["MaritalStatus", sortingOrder]);
            }
            if (isDefined(sortingCrieteria.NativePlace)) {
                tempValue = sortingCrieteria.NativePlace;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: [
                        sequelize.col("FamilyMaster->NativePlaceMaster.Name"),
                        tempSortingOrder,
                    ],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });
            }
            if (isDefined(sortingCrieteria.DOB)) {
                tempValue = sortingCrieteria.DOB;
                tempSortingOrder =
                    tempValue.substring(
                        tempValue.indexOf("#") + 1,
                        tempValue.length
                    ) === "0"
                        ? "DESC"
                        : "ASC";
                tempSortingCrieteriaArray.push({
                    value: ["DOB", tempSortingOrder],
                    sequenceNo: parseInt(
                        tempValue.substring(0, tempValue.indexOf("#"))
                    ),
                });
            }
            if (tempSortingCrieteriaArray.length === 0) {
                return resolve(false);
            }
            tempSortingCrieteriaArray.sort(function (a, b) {
                const keyA = parseInt(a.sequenceNo);
                const keyB = parseInt(b.sequenceNo);
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });

            await tempSortingCrieteriaArray.map((item, index) => {
                sortingCrieteriaArray.push(item.value);
            });
        }

        if (isDefined(searchKey.Name)) {
            if (searchKey.Name.search(/^[0-9a-zA-Z]+$/) === 0) {
                memberMasterCondition = {
                    ...memberMasterCondition,
                    FirstName: {
                        [Op.like]: `%${searchKey.Name.replace(/\s+/g, " ").trim()}%`,
                    },
                };
            } else {
                return resolve([]);
            }
        }
        if (isDefined(searchKey.MaritalStatus)) {
            memberMasterCondition = {
                ...memberMasterCondition,
                MaritalStatus: searchKey.MaritalStatus,
            };
        }
        if (isDefined(searchKey.Cast)) {
            castMasterCondition = {
                ...castMasterCondition,
                CastName: searchKey.Cast,
            };
        }
        if (isDefined(searchKey.TrustFactor)) {
            trustMasterCondition = {
                ...trustMasterCondition,
                Name: searchKey.TrustFactor,
            };
        }
        if (isDefined(searchKey.BoothName)) {
            boothMasterCondition = {
                ...boothMasterCondition,
                WardName: searchKey.BoothName,
            };
        }
        if (isDefined(searchKey.Sirname)) {
            if (searchKey.Sirname.search(/^[0-9a-zA-Z]+$/) === 0) {
                memberMasterCondition = {
                    ...memberMasterCondition,
                    LastName: {
                        [Op.like]: `%${searchKey.Sirname.replace(/\s+/g, " ").trim()}%`,
                    },
                };
            } else {
                return resolve([]);
            }
        }
        if (isDefined(searchKey.Gender)) {
            memberMasterCondition = {
                ...memberMasterCondition,
                Gender: searchKey.Gender,
            };
        }

        if (isDefined(searchKey.DOB)) {
            condArray.push(
                sequelize.where(
                    sequelize.fn(
                        "datediff",
                        searchKey.DOB,
                        sequelize.col("VoterMaster.DOB")
                    ),
                    {
                        [Op.eq]: 0,
                    }
                )
            );
        }


        // if (isDefined(searchKey.MinDate) || isDefined(searchKey.MaxDate)) {
        //     if (isDefined(searchKey.MinDate) && isDefined(searchKey.MaxDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.between]: [searchKey.MinDate, searchKey.MaxDate],
        //             },
        //         };
        //     } else if (isDefined(searchKey.MinDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.gte]: searchKey.MinDate,
        //             },
        //         };
        //     } else if (isDefined(searchKey.MaxDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.lte]: searchKey.MaxDate,
        //             },
        //         };
        //     }
        // }

        if (isDefined(searchKey.MinAge) || isDefined(searchKey.MaxAge)) {
            if (isDefined(searchKey.MinAge) && isDefined(searchKey.MaxAge)) {
                memberMasterCondition = {
                    ...memberMasterCondition,
                    Age: {
                        [Op.between]: [searchKey.MinAge, searchKey.MaxAge],
                    },
                };
            } else if (isDefined(searchKey.MinAge)) {
                memberMasterCondition = {
                    ...memberMasterCondition,
                    Age: {
                        [Op.gte]: searchKey.MinAge,
                    },
                };
            } else if (isDefined(searchKey.MaxAge)) {
                memberMasterCondition = {
                    ...memberMasterCondition,
                    Age: {
                        [Op.lte]: searchKey.MaxAge,
                    },
                };
            }
        }


        // if (isDefined(searchKey.MinDate) || isDefined(searchKey.MaxDate)) {
        //     if (isDefined(searchKey.MinDate) && isDefined(searchKey.MaxDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.between]: [searchKey.MinDate, searchKey.MaxDate],
        //             },
        //         };
        //     } else if (isDefined(searchKey.MinDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.gte]: searchKey.MinDate,
        //             },
        //         };
        //     } else if (isDefined(searchKey.MaxDate)) {
        //         memberMasterCondition = {
        //             ...memberMasterCondition,
        //             DOB: {
        //                 [Op.lte]: searchKey.MaxDate,
        //             },
        //         };
        //     }
        // }
        //
        // if (isDefined(searchKey.MinAge) || isDefined(searchKey.MaxAge)) {
        //     let minAge = 365.25;
        //     let maxAge = 200 * 365.25;
        //
        //     if (isDefined(searchKey.MinAge)) {
        //         minAge = parseInt(searchKey.MinAge) * 365.25;
        //     }
        //     if (isDefined(searchKey.MaxAge)) {
        //         maxAge = parseInt(searchKey.MaxAge) * 365.25;
        //     }
        //     condArray.push(
        //         sequelize.where(
        //             sequelize.fn(
        //                 "datediff",
        //                 new Date(),
        //                 sequelize.col("VoterMaster.DOB")
        //             ),
        //             {
        //                 [Op.gte]: minAge,
        //             }
        //         )
        //     );
        //     condArray.push(
        //         sequelize.where(
        //             sequelize.fn(
        //                 "datediff",
        //                 new Date(),
        //                 sequelize.col("VoterMaster.DOB")
        //             ),
        //             {
        //                 [Op.lte]: maxAge,
        //             }
        //         )
        //     );
        // }


        if (isDefined(searchKey.City)) {
            addressMasterCondition = {
                ...addressMasterCondition,
                CityOrVillageName: searchKey.City,
            };
        }

        if (isDefined(searchKey.State)) {
            addressMasterCondition = {
                ...addressMasterCondition,
                StateName: searchKey.State,
            };
        }
        if (isDefined(searchKey.District)) {
            addressMasterCondition = {
                ...addressMasterCondition,
                DistrictName: searchKey.District,
            };
        }
        if (isDefined(searchKey.Country)) {
            addressMasterCondition = {
                ...addressMasterCondition,
                CountryName: searchKey.Country,
            };
        }
        if (isDefined(searchKey.NativePlace)) {
            nativePlaceCondition = {
                ...nativePlaceCondition,
                Name: searchKey.NativePlace,
            };
        }

        await voterMaster
            .findAll({
                attributes: VOTER_ATTRIBUTES,
                where: { [Op.and]: memberMasterCondition },
                order:
                    sortingCrieteria !== null && sortingCrieteriaArray.length > 0
                        ? sortingCrieteriaArray
                        : [
                            [
                                sequelize.fn(
                                    "concat",
                                    sequelize.col("VoterMaster.FirstName"),
                                    sequelize.col("VoterMaster.MiddleName"),
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
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["TrustFactorId","Name","Color","ExtraMessage"],
                        model: trustFactorMaster,
                        where:trustMasterCondition
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["WardName"],
                        model: wardMaster,
                        where:boothMasterCondition
                        // as: "OccupationDetail",
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
                    // {
                    //     model: addressMaster,
                    //     as: "OfficeAddressDetail",
                    // },
                    {
                        attributes: ["FamilyId", "HeadId"],
                        model: familyMaster,
                        include: [
                            {
                                model: addressMaster,
                                where: addressMasterCondition,
                                // include: [{ model: region, attributes: ["countryCode"] }],
                            },
                            {
                                attributes: ["CastName"],
                                model: castMaster,
                                where:castMasterCondition
                                // as: "OccupationDetail",
                            },
                            {
                                attributes: ["Name"],
                                model: nativePlaceMaster,
                                where: nativePlaceCondition,
                            },
                        ],
                    },
                ],
            })
            .then(async (result) => {
                const tempResponsearray = [];
                if (result.length > 0) {
                    await result.map((item, index) => {
                        if (result[index].FamilyMaster !== null) {
                            if (result[index].dataValues.MiddleName === null) {
                                result[index].dataValues.MiddleName = "-";
                            }
                            if (result[index].dataValues.LastName === null) {
                                result[index].dataValues.LastName = "-";
                            }
                            if (result[index].dataValues.FirstName === null) {
                                result[index].dataValues.FirstName = "-";
                            }
                            if (isDefined(searchKey.FamilyHead)) {
                                if (
                                    searchKey.FamilyHead.indexOf(headStatus[0]) > -1 &&
                                    parseInt(result[index].dataValues.VoterId) ===
                                    parseInt(result[index].dataValues.FamilyMaster.HeadId)
                                ) {
                                    tempResponsearray.push(result[index]);
                                } else if (
                                    searchKey.FamilyHead.indexOf(headStatus[1]) > -1 &&
                                    parseInt(result[index].dataValues.VoterId) !==
                                    parseInt(result[index].dataValues.FamilyMaster.HeadId)
                                ) {
                                    tempResponsearray.push(result[index]);
                                }
                            } else {
                                tempResponsearray.push(result[index]);
                            }
                        }
                    });
                    tempMemberArray = tempResponsearray;
                }
                return resolve(tempMemberArray);
            });
    });
};

const getAllMembers = async (offset, pageNo) => {
    let tempMemberArray = [];
    let tempVoterId = [1,8,20,21,22]
    let condition = {
        VoterId: { [Op.notIn]: tempVoterId },

    };
    await voterMaster
        .findAll({
            offset: offset + pageLimit,
            limit: pageLimit,
            attributes: ["FirstName"],
        })
        .then((res) => {
            if (res.length > 0) {
                // console.log(`?page=${Math.ceil(offset / 30)}`)
                nextUrl = `?page=${offset / pageLimit + 2}`;
            } else {
                nextUrl = "null";
            }
        });

    await voterMaster
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
            // offset,
            // limit: pageLimit,
        })
        .then(async (res) => {
            if (res.length >= 0) {
                tempMemberArray.push(res);
                return {
                    Data: tempMemberArray,
                    next_endpoint: nextUrl,
                };
            }
        })
        .catch((err) => {
            console.log("error--",err)
            return { Data: tempMemberArray, next_endpoint: nextUrl };
        });
    if (tempMemberArray.length !== 0) {
        return { Data: tempMemberArray, next_endpoint: nextUrl };
    }
    return { Data: tempMemberArray, next_endpoint: nextUrl };
};
const searchData = async (searchKey) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars
    return new Promise(async (resolve, reject) => {
        let tempMemberArray = [];
        let dob = "";
        console.log(searchKey)
        if (searchKey.length > 2) {
            const tempMonthName = searchKey;
            let tempName = "";
            for (let i = 0; i < tempMonthName.length; i++) {
                if (tempMonthName[i].toUpperCase() !== tempMonthName[i].toLowerCase()) {
                    tempName += tempMonthName[i];
                }
            }
            monthArray.map((monthName) => {
                if (
                    monthName.substring(0, searchKey.length).toLowerCase() ===
                    tempName.toLowerCase()
                ) {
                    dob = getMonthFromString(searchKey);
                }
            });
        }

        const condition = {
            // MiddleName: { [Op.ne]: null },
            nameTxt: sequelize.or(
                sequelize.where(
                    sequelize.fn(
                        "concat",
                        "lower",
                        sequelize.col("VoterMaster.FirstName"),
                        " ",
                        sequelize.col("VoterMaster.MiddleName"),
                    ),
                    "LIKE",
                    `%${searchKey.replace(/\s+/g, " ").toLowerCase().trim()}%`
                ),
                whereClause("VoterMaster.Mobile", searchKey),
                whereClause("VoterMaster.Email", searchKey),
                // whereClause("FamilyMaster.AddressMaster.CityName", searchKey),
                whereClause("VoterMaster.MaritalStatus", searchKey),
                // whereClause("MemberMaster.Gender", searchKey),
                sequelize.where(
                    sequelize.col("VoterMaster.Gender"),
                    Op.eq,
                    searchKey.toUpperCase()
                ),
                sequelize.where(sequelize.col("VoterMaster.DOB"), "LIKE", dob.trim())
            ),
        };
        await voterMaster
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
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["TrustFactorId","Name","Color","ExtraMessage"],
                        model: trustFactorMaster,

                        // as: "OccupationDetail",
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
                    // {
                    //     model: addressMaster,
                    //     as: "OfficeAddressDetail",
                    // },
                    {
                        attributes: ["FamilyId"],
                        model: familyMaster,
                        include: [
                            {
                                model: addressMaster,
                                // include: [{ model: region, attributes: ["countryCode"] }],
                            },
                            {
                                attributes: ["Name"],
                                model: nativePlaceMaster,
                            },
                        ],
                    },
                ],
            })
            .then(async (result) => {
                if (result.length > 0) {
                    await result.map((item, index) => {
                        if (result[index].dataValues.MiddleName === null) {
                            result[index].dataValues.MiddleName = "-";
                        }
                        if (result[index].dataValues.LastName === null) {
                            result[index].dataValues.LastName = "-";
                        }
                        if (result[index].dataValues.FirstName === null) {
                            result[index].dataValues.FirstName = "-";
                        }
                    });
                    tempMemberArray = result;
                }
                return resolve(tempMemberArray);
            });
    });
};

const createName = (Name) => {
    let tempName = "-";
    if (Name === null) {
        return tempName;
    }
    if (Name.FirstName && Name.FirstName != null && isDefined(Name.FirstName)) {
        tempName = Name.FirstName;
    }
    if (
        Name.MiddleName &&
        Name.MiddleName != null &&
        isDefined(Name.MiddleName)
    ) {
        tempName = `${tempName} ${Name.MiddleName} `;
    }
    if (Name.LastName && Name.LastName != null && isDefined(Name.LastName)) {
        tempName += Name.LastName;
    }
    return tempName;
};

const getStateNameFromCountry = () => {
    return new Promise((resolve) => {
        let responseObj = {};
        region.findAll({ attributes: ["country", "state"] }).then(async (res) => {
            if (res) {
                const countryArray = await loadash.groupBy(res, "country");
                await Object.entries(countryArray).forEach(async ([key, value]) => {
                    let tempStateName = [];
                    value.map((country) => {
                        tempStateName.push(country.dataValues);
                    });
                    tempStateName = await removeDuplicates(tempStateName, "state");
                    const tempValueArray = [];
                    tempStateName.map((stateName) => {
                        tempValueArray.push(stateName.state);
                    });
                    responseObj = { ...responseObj, [key]: tempValueArray };
                    tempStateName = [];
                });
                resolve({ country: responseObj });
            } else {
                resolve(false);
            }
        });
    });
};

const getCityNameFromState = () => {
    return new Promise((resolve) => {
        let responseObj = {};
        region.findAll({ attributes: ["state", "city"] }).then(async (res) => {
            if (res) {
                const stateArray = await loadash.groupBy(res, "state");
                await Object.entries(stateArray).forEach(async ([key, value]) => {
                    let tempStateName = [];
                    value.map((state) => {
                        tempStateName.push(state.dataValues);
                    });
                    tempStateName = await removeDuplicates(tempStateName, "city");
                    const tempValueArray = [];
                    tempStateName.map((cityName) => {
                        tempValueArray.push(cityName.city);
                    });
                    responseObj = { ...responseObj, [key]: tempValueArray };
                    tempStateName = [];
                });
                resolve({ state: responseObj });
            } else {
                resolve(false);
            }
        });
    });
};

const getCountryCode = () => {
    return new Promise((resolve) => {
        region
            .findAll({
                attributes: ["country", "countryCode"],
            })
            .then(async (response) => {
                if (response) {
                    const countryCodeArray = await loadash.groupBy(response, "country");
                    let responseObj = {};
                    await Object.entries(countryCodeArray).forEach(
                        async ([key, value]) => {
                            let tempCountryName = [];
                            value.map((country) => {
                                tempCountryName.push(country.dataValues);
                            });
                            tempCountryName = await removeDuplicates(
                                tempCountryName,
                                "country"
                            );
                            const tempValueArray = [];
                            tempCountryName.map((country) => {
                                tempValueArray.push(country.countryCode);
                            });
                            responseObj = { ...responseObj, [key]: tempValueArray.join("") };

                            tempCountryName = [];
                        }
                    );
                    resolve(responseObj);
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
const getSpecificMemberDetailForUpdate = async (memberId) => {
    let condition = "";
    let tempData = "";
    let tempDataArray = [];
    let attributeList = [];
    const tempSearchData = [];
    const memberArrayForProfile = [];

    condition = {
        Gender: { [Op.eq]: "MALE" },
        MaritalStatus: { [Op.eq]: "MARRIED" },
        MemberId: { [Op.ne]: memberId },
    };
    attributeList = ["MemberId", "FirstName", "LastName", "MiddleName"];
    await getSpecificMemberDetail(memberId).then((res) => {
        memberArrayForProfile.push(res.Data[0]);
    });
    tempData = "";
    tempDataArray = [];
    await getDataFromTable(memberMaster, attributeList, condition).then(
        async (res) => {
            await res.map((data) => {
                tempData = data.dataValues;
                tempDataArray.push(
                    `${`${tempData.MemberId}#`}${tempData.FirstName} ${
                        tempData.MiddleName
                        } ${tempData.LastName}`
                );
            });
            tempSearchData.push({
                MaleNames: tempDataArray.sort().slice(0).reverse(),
            });
            attributeList = [];
        }
    );
    condition = {
        Gender: { [Op.eq]: "FEMALE" },
        MaritalStatus: { [Op.eq]: "MARRIED" },
        MemberId: { [Op.ne]: memberId },
    };
    attributeList = ["MemberId", "FirstName", "LastName", "MiddleName"];
    tempData = "";
    tempDataArray = [];
    await getDataFromTable(memberMaster, attributeList, condition).then(
        async (res) => {
            await res.map((data) => {
                tempData = data.dataValues;
                tempDataArray.push(
                    `${`${tempData.MemberId}#`}${tempData.FirstName} ${
                        tempData.MiddleName
                        } ${tempData.LastName}`
                );
            });
            tempSearchData[0].FemaleNames = tempDataArray.sort().slice(0).reverse();
            attributeList = [];
        }
    );
    tempData = "";
    tempDataArray = [];
    attributeList = ["Name"];
    condition = "";
    await getDataFromTable(occupationMaster, attributeList, condition).then(
        async (res) => {
            await res.map((data) => {
                tempData = data.dataValues;
                tempDataArray.push(tempData.Name);
            });
            tempSearchData[0].Occupations = tempDataArray.sort().slice(0).reverse();
            attributeList = [];
        }
    );
    tempData = "";
    tempDataArray = [];
    attributeList = ["country", "state", "city"];
    condition = "";

    await getDataFromTable(region, attributeList, condition).then(async (res) => {
        await res.map((data) => {
            tempData = data.dataValues;
            tempDataArray.push({
                ...tempData,
            });
        });
        const states = [];
        const country = [];
        const cities = [];

        tempDataArray.map((regionData) => {
            states.push(regionData.state);
            country.push(regionData.country);
            cities.push(regionData.city);
        });
        await getStateNameFromCountry().then((res) => {
            if (res) {
                tempSearchData[0].States = res;
            }
        });
        await getCityNameFromState().then((res) => {
            if (res) {
                tempSearchData[0].Citites = res;
            }
        });

        await getCountryCode().then((countryCodes) => {
            if (res) {
                tempSearchData[0].CountryCode = countryCodes;
            }
        });

        // tempSearchData[0].States = uniq(states);
        tempSearchData[0].Countries = uniq(country);
        // tempSearchData[0].Citites = uniq(cities);
        attributeList = [];
    });
    tempData = "";
    tempDataArray = [];

    await memberMaster
        .findAll({
            attributes: [
                [
                    sequelize.fn("DISTINCT", sequelize.col("MaritalStatus")),
                    "MaritalStatus",
                ],
            ],
        })
        .then(async (res) => {
            await res.map((data) => {
                tempData = data.dataValues;
                tempDataArray.push(tempData.MaritalStatus);
            });
            tempSearchData[0].MaritalStatuses = tempDataArray
                .sort()
                .slice(0)
                .reverse();
        });

    tempData = "";
    tempDataArray = [];
    attributeList = ["Name"];
    condition = "";

    await getDataFromTable(nativeMaster, attributeList, condition).then(
        async (res) => {
            await res.map((data) => {
                tempData = data.dataValues;
                tempDataArray.push(tempData.Name);
            });
            tempSearchData[0].NativePlaces = tempDataArray;
            attributeList = [];
        }
    );
    const finalArray = {
        UserData: memberArrayForProfile[0],
        SearchData: tempSearchData,
    };
    return { Data: finalArray };
};

const addToken = (memberId, token) => {
    return new Promise(async (resolve) => {
        const member = await memberMaster.findAll({
            where: { MemberId: memberId },
        });
        const memberToken = member[0].dataValues.MemberToken;
        if (memberToken === null || memberToken === "") {
            memberMaster
                .update({ MemberToken: token }, { where: { MemberId: memberId } })
                .then((updateRes) => {
                    if (updateRes) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch((ex) => {
                    resolve(false);
                });
        } else {
            let tokenToBeAdded = "";
            tokenToBeAdded = `${memberToken},${token}`;
            memberMaster
                .update(
                    { MemberToken: tokenToBeAdded },
                    { where: { MemberId: memberId } }
                )
                .then((updateRes) => {
                    if (updateRes) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch((ex) => {
                    resolve(false);
                });
        }
    });
};

const resetToken = async (memberId, token) => {
    const member = await memberMaster.findAll({ where: { MemberId: memberId } });
    if (member.length !== 0) {
        memberMaster.update(
            { MemberToken: token },
            { where: { MemberId: memberId } }
        );
    }
};
const decodeDataFromToken = (token) => {
    return new Promise((resolve) => {
        let tokenData = "";
        // eslint-disable-next-line consistent-return
        jwt.verify(token, "", function (err, decoded) {
            if (err) {
                return resolve(false);
            }
            tokenData = decoded;
            return resolve(tokenData);
        });
    });
};

const getMemberIdFromToken = async (token) => {
    return new Promise(() => {
        decodeDataFromToken(token).then((res) => {
            return res.memberId;
        });
    });
};

const addDeviceId = async (deviceId, userId) => {
    const deviceCondition = {};
    deviceCondition.DeviceId = { [Op.eq]: deviceId };
    const devices = await MemberDevice.findAll({ where: deviceCondition });
    if (devices.length === 0) {
        const deviceData = {
            deviceId,
            memberId: userId,
        };
        await MemberDevice.create(deviceData)
            .then(() => {})
            .catch(() => {});
    }
};

const getMemberData = (offset, pageNo) => {
    return new Promise((resolve) => {
        // eslint-disable-next-line no-shadow
        let nextUrl = "";
        if (offset < 0) {
            pageLimit = totalMembers;
            offset = 0;
        } else {
            pageLimit = PAGE_LIMIT;
        }

        getAllMembers(offset, pageNo).then((data) => {
            nextUrl = data.next_endpoint;
            return resolve({ Data: data.Data[0], next_endpoint: nextUrl });
        });
    });
};

const getMemberDetail = (memberId) => {
    return new Promise((resolve) => {
        const UserInfo = [];
        // eslint-disable-next-line no-shadow
        let nextUrl = "";
        getSpecificMemberDetail(memberId).then(async (data) => {
            if (data) {
                await data.Data.map((member) => {
                    UserInfo.push(member);
                });
                nextUrl = data.next_endpoint;
                return resolve({ Data: UserInfo, next_endpoint: nextUrl });
            }
            return resolve({ Data: UserInfo, next_endpoint: nextUrl });
        });
    });
};

const addTokenToTable = async (memberId, token) => {
    // eslint-disable-next-line no-unused-vars,no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        await addToken(memberId, token).then((addTokenRes) => {
            resolve(addTokenRes);
        });
    });
};

const setTokenAfterPasswordChange = async (memberId, token) => {
    // eslint-disable-next-line no-unused-vars,no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        await resetToken(memberId, token);
        resolve(true);
    });
};

const whereClause = (coulmnName, value) => {
    return sequelize.where(
        sequelize.col(coulmnName),
        "LIKE",
        `%${value.toLowerCase().trim()}%`
    );
};

const getMemberById = async (memberId) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars
    return new Promise(async (resolve, reject) => {
        await memberMaster
            .findAll({
                where: { MemberId: { [Op.eq]: `${memberId}` } },
                attributes: ["Mobile", "DOB"],
            })
            .then((res) => {
                return resolve(res[0].dataValues);
            });
    });
};

const removeToken = async (token) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars,consistent-return
    return new Promise(async (resolve, reject) => {
        let tokenData = "";
        await decodeDataFromToken(token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });

        const condition = { MemberId: { [Op.eq]: `${tokenData.memberId}` } };
        const member = await memberMaster.findAll({ where: condition });
        if (member.length === 0) {
            return resolve(false);
        }
        if (member[0].dataValues.MemberToken.length > 0) {
            let tokens = member[0].dataValues.MemberToken;
            tokens = tokens.split(",");
            if (tokens.length === 1) {
                memberMaster
                    .update(
                        { MemberToken: "" },
                        { where: { MemberId: tokenData.memberId } }
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
                    memberMaster
                        .update(
                            { MemberToken: updatedToken },
                            { where: { MemberId: { [Op.eq]: `${tokenData.memberId}` } } }
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



// const filterData = async (searchKey, sortingCrieteria = null) => {
//     // eslint-disable-next-line no-async-promise-executor,no-unused-vars
//     return new Promise(async (resolve, reject) => {
//         let tempMemberArray = [];
//         const dob = "";
//         let memberMasterCondition = {
//             MiddleName: { [Op.ne]: null },
//             FirstName: { [Op.ne]: null },
//             LastName: { [Op.ne]: null },
//         };
//         let addressMasterCondition = "";
//         let nativePlaceCondition = "";
//         const condArray = [];
//         const tempSortingCrieteriaArray = [];
//         const sortingCrieteriaArray = [];
//         let tempValue = null;
//         let tempSortingOrder = null;
//         if (sortingCrieteria !== null) {
//             if (isDefined(sortingCrieteria.FirstName)) {
//                 tempValue = sortingCrieteria.FirstName;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: ["FirstName", tempSortingOrder],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//             }
//             if (isDefined(sortingCrieteria.MiddleName)) {
//                 tempValue = sortingCrieteria.MiddleName;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: ["MiddleName", tempSortingOrder],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//                 // tempSortingCrieteriaArray.push(["MiddleName", sortingOrder]);
//             }
//             if (isDefined(sortingCrieteria.LastName)) {
//                 tempValue = sortingCrieteria.LastName;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: ["LastName", tempSortingOrder],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//
//                 // tempSortingCrieteriaArray.push(["LastName", sortingOrder]);
//             }
//             if (isDefined(sortingCrieteria.MaritalStatus)) {
//                 tempValue = sortingCrieteria.MaritalStatus;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: ["MaritalStatus", tempSortingOrder],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//                 // tempSortingCrieteriaArray.push(["MaritalStatus", sortingOrder]);
//             }
//             if (isDefined(sortingCrieteria.NativePlace)) {
//                 tempValue = sortingCrieteria.NativePlace;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: [
//                         sequelize.col("FamilyMaster->NativePlaceMaster.Name"),
//                         tempSortingOrder,
//                     ],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//             }
//             if (isDefined(sortingCrieteria.DOB)) {
//                 tempValue = sortingCrieteria.DOB;
//                 tempSortingOrder =
//                     tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
//                     "0"
//                         ? "DESC"
//                         : "ASC";
//                 tempSortingCrieteriaArray.push({
//                     value: ["DOB", tempSortingOrder],
//                     sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
//                 });
//             }
//             if (tempSortingCrieteriaArray.length === 0) {
//                 return resolve(false);
//             }
//             tempSortingCrieteriaArray.sort(function (a, b) {
//                 const keyA = parseInt(a.sequenceNo);
//                 const keyB = parseInt(b.sequenceNo);
//                 if (keyA < keyB) return -1;
//                 if (keyA > keyB) return 1;
//                 return 0;
//             });
//
//             await tempSortingCrieteriaArray.map((item, index) => {
//                 sortingCrieteriaArray.push(item.value);
//             });
//         }
//
//         if (isDefined(searchKey.Name)) {
//             if (searchKey.Name.search(/^[0-9a-zA-Z]+$/) === 0) {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     FirstName: {
//                         [Op.like]: `%${searchKey.Name.replace(/\s+/g, " ").trim()}%`,
//                     },
//                 };
//             } else {
//                 return resolve([]);
//             }
//         }
//         if (isDefined(searchKey.MaritalStatus)) {
//             memberMasterCondition = {
//                 ...memberMasterCondition,
//                 MaritalStatus: searchKey.MaritalStatus,
//             };
//         }
//         if (isDefined(searchKey.Sirname)) {
//             if (searchKey.Sirname.search(/^[0-9a-zA-Z]+$/) === 0) {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     LastName: {
//                         [Op.like]: `%${searchKey.Sirname.replace(/\s+/g, " ").trim()}%`,
//                     },
//                 };
//             } else {
//                 return resolve([]);
//             }
//         }
//         if (isDefined(searchKey.Gender)) {
//             memberMasterCondition = {
//                 ...memberMasterCondition,
//                 Gender: searchKey.Gender,
//             };
//         }
//
//         if (isDefined(searchKey.IsDaughter)) {
//             const tempArray = [];
//             if (searchKey.IsDaughter.indexOf(daughterStatus[0]) > -1) {
//                 tempArray.push("0");
//             }
//             if (searchKey.IsDaughter.indexOf(daughterStatus[1]) > -1) {
//                 tempArray.push("1");
//             }
//
//             if (isDefined(searchKey.Gender)) {
//                 if (searchKey.Gender.indexOf(gender[0]) > -1) {
//                     memberMasterCondition = {
//                         ...memberMasterCondition,
//                         Gender: {
//                             [Op.eq]: "NOTMATCHED",
//                         },
//                         IsDaughterFamily: tempArray,
//                     };
//                 }
//                 if (searchKey.Gender.indexOf(gender[1]) > -1) {
//                     memberMasterCondition = {
//                         ...memberMasterCondition,
//                         Gender: {
//                             [Op.eq]: "FEMALE",
//                         },
//                         IsDaughterFamily: tempArray,
//                     };
//                 }
//             } else {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     Gender: {
//                         [Op.eq]: "FEMALE",
//                     },
//                     IsDaughterFamily: tempArray,
//                 };
//             }
//         }
//         if (isDefined(searchKey.DOB)) {
//             condArray.push(
//                 sequelize.where(
//                     sequelize.fn(
//                         "datediff",
//                         searchKey.DOB,
//                         sequelize.col("MemberMaster.DOB")
//                     ),
//                     {
//                         [Op.eq]: 0,
//                     }
//                 )
//             );
//         }
//
//         if (isDefined(searchKey.MinDate) || isDefined(searchKey.MaxDate)) {
//             if (isDefined(searchKey.MinDate) && isDefined(searchKey.MaxDate)) {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     DOB: {
//                         [Op.between]: [searchKey.MinDate, searchKey.MaxDate],
//                     },
//                 };
//             } else if (isDefined(searchKey.MinDate)) {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     DOB: {
//                         [Op.gte]: searchKey.MinDate,
//                     },
//                 };
//             } else if (isDefined(searchKey.MaxDate)) {
//                 memberMasterCondition = {
//                     ...memberMasterCondition,
//                     DOB: {
//                         [Op.lte]: searchKey.MaxDate,
//                     },
//                 };
//             }
//         }
//
//         if (isDefined(searchKey.MinAge) || isDefined(searchKey.MaxAge)) {
//             let minAge = 365.25;
//             let maxAge = 200 * 365.25;
//
//             if (isDefined(searchKey.MinAge)) {
//                 minAge = parseInt(searchKey.MinAge) * 365.25;
//             }
//             if (isDefined(searchKey.MaxAge)) {
//                 maxAge = parseInt(searchKey.MaxAge) * 365.25;
//             }
//             condArray.push(
//                 sequelize.where(
//                     sequelize.fn(
//                         "datediff",
//                         new Date(),
//                         sequelize.col("MemberMaster.DOB")
//                     ),
//                     {
//                         [Op.gte]: minAge,
//                     }
//                 )
//             );
//
//             condArray.push(
//                 sequelize.where(
//                     sequelize.fn(
//                         "datediff",
//                         new Date(),
//                         sequelize.col("MemberMaster.DOB")
//                     ),
//                     {
//                         [Op.lte]: maxAge,
//                     }
//                 )
//             );
//         }
//
//         condArray.push(memberMasterCondition);
//         if (isDefined(searchKey.City)) {
//             addressMasterCondition = {
//                 ...addressMasterCondition,
//                 CityName: searchKey.City,
//             };
//         }
//
//         if (isDefined(searchKey.State)) {
//             addressMasterCondition = {
//                 ...addressMasterCondition,
//                 StateName: searchKey.State,
//             };
//         }
//         if (isDefined(searchKey.Country)) {
//             addressMasterCondition = {
//                 ...addressMasterCondition,
//                 CountryName: searchKey.Country,
//             };
//         }
//         if (isDefined(searchKey.NativePlace)) {
//             nativePlaceCondition = {
//                 ...nativePlaceCondition,
//                 Name: searchKey.NativePlace,
//             };
//         }
//
//         await memberMaster
//             .findAll({
//                 attributes: [
//                     "MemberId",
//                     "FirstName",
//                     "MiddleName",
//                     "LastName",
//                     "Email",
//                     "Mobile",
//                     "DOB",
//                     "AadhaarNo",
//                     "MaritalStatus",
//                     "BloodGroup",
//                     "Zodiac",
//                     "Gender",
//                     "Studies",
//                     "MarriageDate",
//                     "ProfileImage",
//                     "IsDaughterFamily",
//                     "SpouseId",
//                 ],
//                 where: { [Op.and]: condArray },
//                 order:
//                     sortingCrieteria !== null && sortingCrieteriaArray.length > 0
//                         ? sortingCrieteriaArray
//                         : [
//                             [
//                                 sequelize.fn(
//                                     "concat",
//                                     sequelize.col("MemberMaster.FirstName"),
//                                     sequelize.col("MemberMaster.MiddleName"),
//                                     sequelize.col("MemberMaster.LastName")
//                                 ),
//                                 "ASC",
//                             ],
//                         ],
//
//                 include: [
//                     {
//                         attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//                         model: memberMaster,
//                         as: "MotherEntry",
//                     },
//                     {
//                         attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//                         model: memberMaster,
//                         as: "FatherEntry",
//                     },
//                     {
//                         attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//                         model: memberMaster,
//                         as: "SpouseEntry",
//                     },
//                     {
//                         attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//                         model: memberMaster,
//                         as: "FatherInLawDetail",
//                     },
//                     {
//                         attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//                         model: memberMaster,
//                         as: "MotherInLawDetail",
//                     },
//                     {
//                         attributes: ["Name"],
//                         model: occupationMaster,
//                         as: "OccupationDetail",
//                     },
//                     {
//                         model: addressMaster,
//                         as: "OfficeAddressDetail",
//                     },
//                     {
//                         attributes: ["FamilyId", "HeadId"],
//                         model: familyMaster,
//                         include: [
//                             {
//                                 model: addressMaster,
//                                 where: addressMasterCondition,
//                                 include: [{ model: region, attributes: ["countryCode"] }],
//                             },
//                             {
//                                 attributes: ["Name"],
//                                 model: nativeMaster,
//                                 where: nativePlaceCondition,
//                             },
//                         ],
//                     },
//                 ],
//             })
//             .then(async (result) => {
//                 const tempResponsearray = [];
//                 if (result.length > 0) {
//                     await result.map((item, index) => {
//                         if (result[index].FamilyMaster !== null) {
//                             if (result[index].dataValues.MiddleName === null) {
//                                 result[index].dataValues.MiddleName = "-";
//                             }
//                             if (result[index].dataValues.LastName === null) {
//                                 result[index].dataValues.LastName = "-";
//                             }
//                             if (result[index].dataValues.FirstName === null) {
//                                 result[index].dataValues.FirstName = "-";
//                             }
//                             if (isDefined(searchKey.FamilyHead)) {
//                                 if (
//                                     searchKey.FamilyHead.indexOf(headStatus[0]) > -1 &&
//                                     parseInt(result[index].dataValues.MemberId) ===
//                                     parseInt(result[index].dataValues.FamilyMaster.HeadId)
//                                 ) {
//                                     tempResponsearray.push(result[index]);
//                                 } else if (
//                                     searchKey.FamilyHead.indexOf(headStatus[1]) > -1 &&
//                                     parseInt(result[index].dataValues.MemberId) !==
//                                     parseInt(result[index].dataValues.FamilyMaster.HeadId)
//                                 ) {
//                                     tempResponsearray.push(result[index]);
//                                 }
//                             } else {
//                                 tempResponsearray.push(result[index]);
//                             }
//                         }
//                     });
//                     tempMemberArray = tempResponsearray;
//                 }
//                 return resolve(tempMemberArray);
//             });
//     });
// };

// const filterData = async (searchKey) => {
//   // eslint-disable-next-line no-async-promise-executor,no-unused-vars
//   return new Promise(async (resolve, reject) => {
//     let tempMemberArray = [];
//     const dob = "";
//     let memberMasterCondition = {
//       MiddleName: { [Op.ne]: null },
//       FirstName: { [Op.ne]: null },
//       LastName: { [Op.ne]: null },
//     };
//     let addressMasterCondition = "";
//     let nativePlaceCondition = "";
//     const condArray = [];
//
//     if (isDefined(searchKey.Name)) {
//       if (searchKey.Name.search(/^[0-9a-zA-Z]+$/) === 0) {
//         memberMasterCondition = {
//           ...memberMasterCondition,
//           FirstName: {
//             [Op.like]: `%${searchKey.Name.replace(/\s+/g, " ").trim()}%`,
//           },
//         };
//       } else {
//         return resolve([]);
//       }
//     }
//     if (isDefined(searchKey.MaritalStatus)) {
//       memberMasterCondition = {
//         ...memberMasterCondition,
//         MaritalStatus: searchKey.MaritalStatus,
//       };
//     }
//     if (isDefined(searchKey.Sirname)) {
//       if (searchKey.Sirname.search(/^[0-9a-zA-Z]+$/) === 0) {
//         memberMasterCondition = {
//           ...memberMasterCondition,
//           LastName: {
//             [Op.like]: `%${searchKey.Sirname.replace(/\s+/g, " ").trim()}%`,
//           },
//         };
//       } else {
//         return resolve([]);
//       }
//     }
//     if (isDefined(searchKey.Gender)) {
//       memberMasterCondition = {
//         ...memberMasterCondition,
//         Gender: {
//           [Op.eq]: searchKey.Gender.replace(/\s+/g, " ").trim(),
//         },
//       };
//     }
//     if (isDefined(searchKey.IsDaughter)) {
//       memberMasterCondition = {
//         ...memberMasterCondition,
//         Gender: {
//           [Op.eq]: "FEMALE",
//         },
//         IsDaughterFamily: searchKey.IsDaughter,
//       };
//     }
//     if (isDefined(searchKey.DOB)) {
//       condArray.push(
//         sequelize.where(
//           sequelize.fn(
//             "datediff",
//             searchKey.DOB,
//             sequelize.col("MemberMaster.DOB")
//           ),
//           {
//             [Op.eq]: 0,
//           }
//         )
//       );
//     }
//
//     if (isDefined(searchKey.MinAge) || isDefined(searchKey.MaxAge)) {
//       let minAge = 365.25;
//       let maxAge = 200 * 365.25;
//
//       if (isDefined(searchKey.MinAge)) {
//         minAge = parseInt(searchKey.MinAge) * 365.25;
//       }
//       if (isDefined(searchKey.MaxAge)) {
//         maxAge = parseInt(searchKey.MaxAge) * 365.25;
//       }
//       condArray.push(
//         sequelize.where(
//           sequelize.fn(
//             "datediff",
//             new Date(),
//             sequelize.col("MemberMaster.DOB")
//           ),
//           {
//             [Op.gte]: minAge,
//           }
//         )
//       );
//
//       condArray.push(
//         sequelize.where(
//           sequelize.fn(
//             "datediff",
//             new Date(),
//             sequelize.col("MemberMaster.DOB")
//           ),
//           {
//             [Op.lte]: maxAge,
//           }
//         )
//       );
//     }
//
//     condArray.push(memberMasterCondition);
//     if (isDefined(searchKey.City)) {
//       addressMasterCondition = {
//         ...addressMasterCondition,
//         CityName: {
//           [Op.like]: `%${searchKey.City.replace(/\s+/g, " ").trim()}%`,
//         },
//       };
//     }
//
//     if (isDefined(searchKey.State)) {
//       addressMasterCondition = {
//         ...addressMasterCondition,
//         StateName: {
//           [Op.like]: `%${searchKey.State.replace(/\s+/g, " ").trim()}%`,
//         },
//       };
//     }
//     if (isDefined(searchKey.Country)) {
//       addressMasterCondition = {
//         ...addressMasterCondition,
//         CountryName: {
//           [Op.like]: `%${searchKey.Country.replace(/\s+/g, " ").trim()}%`,
//         },
//       };
//     }
//     if (isDefined(searchKey.NativePlace)) {
//       nativePlaceCondition = {
//         ...nativePlaceCondition,
//         Name: {
//           [Op.like]: `%${searchKey.NativePlace.replace(/\s+/g, " ").trim()}%`,
//         },
//       };
//     }
//
//     await memberMaster
//       .findAll({
//         attributes: [
//           "MemberId",
//           "FirstName",
//           "MiddleName",
//           "LastName",
//           "Email",
//           "Mobile",
//           "DOB",
//           "AadhaarNo",
//           "MaritalStatus",
//           "BloodGroup",
//           "Zodiac",
//           "Gender",
//           "Studies",
//           "MarriageDate",
//           "ProfileImage",
//           "IsDaughterFamily",
//         ],
//         where: { [Op.and]: condArray },
//         order: [
//           [
//             sequelize.fn(
//               "concat",
//               sequelize.col("MemberMaster.FirstName"),
//               sequelize.col("MemberMaster.MiddleName"),
//               sequelize.col("MemberMaster.LastName")
//             ),
//             "ASC",
//           ],
//         ],
//
//         include: [
//           {
//             attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//             model: memberMaster,
//             as: "MotherEntry",
//           },
//           {
//             attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//             model: memberMaster,
//             as: "FatherEntry",
//           },
//           {
//             attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//             model: memberMaster,
//             as: "FatherInLawDetail",
//           },
//           {
//             attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
//             model: memberMaster,
//             as: "MotherInLawDetail",
//           },
//           {
//             attributes: ["Name"],
//             model: occupationMaster,
//             as: "OccupationDetail",
//           },
//           {
//             model: addressMaster,
//             as: "OfficeAddressDetail",
//           },
//           {
//             attributes: ["FamilyId", "HeadId"],
//             model: familyMaster,
//             include: [
//               {
//                 model: addressMaster,
//                 where: addressMasterCondition,
//               },
//               {
//                 attributes: ["Name"],
//                 model: nativeMaster,
//                 where: nativePlaceCondition,
//               },
//             ],
//           },
//         ],
//       })
//       .then(async (result) => {
//         const tempResponsearray = [];
//         if (result.length > 0) {
//           await result.map((item, index) => {
//             if (result[index].FamilyMaster !== null) {
//               if (result[index].dataValues.MiddleName === null) {
//                 result[index].dataValues.MiddleName = "-";
//               }
//               if (result[index].dataValues.LastName === null) {
//                 result[index].dataValues.LastName = "-";
//               }
//               if (result[index].dataValues.FirstName === null) {
//                 result[index].dataValues.FirstName = "-";
//               }
//               if (isDefined(searchKey.isFamilyHead)) {
//                 if (
//                   searchKey.isFamilyHead.toUpperCase() === "YES" &&
//                   parseInt(result[index].dataValues.MemberId) ===
//                     parseInt(result[index].dataValues.FamilyMaster.HeadId)
//                 ) {
//                   tempResponsearray.push(result[index]);
//                 } else if (
//                   searchKey.isFamilyHead.toUpperCase() === "NO" &&
//                   parseInt(result[index].dataValues.MemberId) !==
//                     parseInt(result[index].dataValues.FamilyMaster.HeadId)
//                 ) {
//                   tempResponsearray.push(result[index]);
//                 }
//               } else {
//                 tempResponsearray.push(result[index]);
//               }
//             }
//           });
//           tempMemberArray = tempResponsearray;
//         }
//         return resolve(tempMemberArray);
//       });
//   });
// };

const updateUserProfile = async (memberId, userDataObj) => {
    return new Promise(async (resolve) => {
        let updateValuesForMemberMaster = {};
        let updateValuesForAddressMaster = {};
        let updateValueForFamilyMaster = {};
        let tempData = "";
        let condition = "";
        let addressId = 0;
        let familyId = 0;
        let flag = 0;
        const message = "";
        const userOriginalData = [];
        let role = "NORMAL";
        // await getUserRole(memberId).then((userRole) => {
        //     role = userRole;
        // });

        console.log(userDataObj)

        await getSpecificMemberDetail(memberId).then((res) => {
            userOriginalData.push(res.Data[0]);
        });
        condition = {
            VoterId: { [Op.eq]: `${memberId}` },
        };
        // await getMemberIdFromTable(memberMaster, condition).then((res) => {
        //   memberSize = res.length;
        // });
        // if (memberSize === 0) {
        //   flag = 1;
        //   return resolve(false);
        // }


        await getIdFromTable(voterMaster, condition).then((res) => {
            if (res.length === 0) {
                flag = 1;
            }
            familyId = res[0].dataValues.FamilyId;
        });

        condition = {
            FamilyId: { [Op.eq]: `${familyId}` },
        };
        await getIdFromTable(familyMaster, condition).then((res) => {
            if (res.length === 0) {
                flag = 1;
            }
            addressId = res[0].dataValues.ResidenceAddressId;
        });

        tempData = userDataObj.MemberName;
        console.log("update obj--",userDataObj)
        updateValuesForMemberMaster = {
            FirstName: checkForValueForUpdate(tempData.FirstName),
            MiddleName: checkForValueForUpdate(tempData.MiddleName),
            LastName: checkForValueForUpdate(tempData.LastName),
            DOB: checkForValueForUpdate(userDataObj.DOB),
            AadhaarNo: checkForValueForUpdate(userDataObj.AadhaarNo),
            BloodGroup: checkForValueForUpdate(userDataObj.BloodGroup),
            Zodiac: checkForValueForUpdate(userDataObj.Zodiac),
            Gender: checkForValueForUpdate(userDataObj.Gender),
            MaritalStatus:
                checkForValueForUpdate(userDataObj.MaritalStatus),
            Studies: checkForValueForUpdate(userDataObj.Studies),
            Email: checkForValueForUpdate(userDataObj.Email),
            Mobile:checkForValueForUpdate(userDataObj.Mobile)
            // IsProfileVerified: "1",
        };
        if (isDefined(userDataObj.MarriageDate)) {
            updateValuesForMemberMaster = {
                ...updateValuesForMemberMaster,
                MarriageDate: userDataObj.MarriageDate,
            };
        }
        if (isDefined(userDataObj.ProfileImage)) {
            updateValuesForMemberMaster = {
                ...updateValuesForMemberMaster,
                ProfileImage: userDataObj.ProfileImage,
            };
        }

        if (isDefined(userDataObj.fatherName)) {
            if (userDataObj.fatherName === "" || userDataObj.fatherName === null) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    FatherId: null,
                };
            } else {
                await getNameFromMemberId(userDataObj.fatherName).then((res) => {
                    if (res) {
                        updateValuesForMemberMaster = {
                            ...updateValuesForMemberMaster,
                            FatherId: userDataObj.fatherName,
                        };
                    }
                });
            }
        }

        if (isDefined(userDataObj.MotherName)) {
            if (userDataObj.MotherName === "" || userDataObj.MotherName === null) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    MotherId: null,
                    MotherName: null,
                };
            } else {
                await getNameFromMemberId(userDataObj.MotherName).then((res) => {
                    if (res) {
                        updateValuesForMemberMaster = {
                            ...updateValuesForMemberMaster,
                            MotherId: userDataObj.MotherName,
                            MotherName: res.FirstName,
                        };
                    }
                });
            }
        }

        if (isDefined(userDataObj.SpouseId)) {
            if (userDataObj.SpouseId === "" || userDataObj.SpouseId === null) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    SpouseId: null,
                };
            } else {
                await getNameFromMemberId(userDataObj.SpouseId).then((res) => {
                    if (res) {
                        updateValuesForMemberMaster = {
                            ...updateValuesForMemberMaster,
                            SpouseId: userDataObj.SpouseId,
                        };
                    }
                });
            }
        }

        if (isDefined(userDataObj.FatherInLawId)) {
            if (
                userDataObj.FatherInLawId === "" ||
                userDataObj.FatherInLawId === null
            ) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    FatherInLawId: null,
                };
            } else {
                await getNameFromMemberId(userDataObj.FatherInLawId).then((res) => {
                    if (res) {
                        updateValuesForMemberMaster = {
                            ...updateValuesForMemberMaster,
                            FatherInLawId: userDataObj.FatherInLawId,
                        };
                    }
                });
            }
        }
        if (isDefined(userDataObj.MotherInLawId)) {
            if (
                userDataObj.MotherInLawId === "" ||
                userDataObj.MotherInLawId === null
            ) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    MotherInLawId: null,
                };
            } else {
                await getNameFromMemberId(userDataObj.MotherInLawId).then((res) => {
                    if (res) {
                        updateValuesForMemberMaster = {
                            ...updateValuesForMemberMaster,
                            MotherInLawId: userDataObj.MotherInLawId,
                        };
                    }
                });
            }
        }

        if (isDefined(userDataObj.NativePlace)) {
            if (userDataObj.NativePlace === "" || userDataObj.NativePlace === null) {
                updateValueForFamilyMaster = {
                    NativePlaceId: null,
                };
            } else {
                condition = {
                    Name: { [Op.eq]: `${userDataObj.NativePlace}` },
                };
                await getIdFromTable(nativePlaceMaster, condition).then((resp) => {
                    updateValueForFamilyMaster = {
                        NativePlaceId: resp[0].dataValues.NativePlaceId,
                    };
                });
            }
        }

        if (isDefined(userDataObj.FamilyHeadName)) {
            updateValueForFamilyMaster = {
                ...updateValueForFamilyMaster,
                HeadId: userDataObj.FamilyHeadName,
            };
        }

        if (isDefined(userDataObj.Occupations)) {
            condition = {
                Name: { [Op.eq]: `${userDataObj.Occupations}` },
            };
            console.log("--condition--",condition)
            if (userDataObj.Occupations === "" || userDataObj.Occupations === null) {
                updateValuesForMemberMaster = {
                    ...updateValuesForMemberMaster,
                    OccupationId: null,
                };
            } else {
                await getIdFromTable(occupationMaster, condition).then((res) => {
                    if (res.length === 0) {
                        return resolve(false);
                    }
                    updateValuesForMemberMaster = {
                        ...updateValuesForMemberMaster,
                        OccupationId: res[0].dataValues.OccupationId,
                    };
                });
            }
        }

        if (isDefined(userDataObj.homeAddressObj)) {
            tempData = userDataObj.homeAddressObj;
            if (!isDefined(tempData.Address)) {
                tempData.homeAddress = userOriginalData[0].Address;
            }
            if (!isDefined(tempData.Country)) {
                tempData.homeCountry = userOriginalData[0].Country;
            }
            if (!isDefined(tempData.State)) {
                tempData.homeState = userOriginalData[0].State;
            }
            if (!isDefined(tempData.City)) {
                tempData.homeCity = userOriginalData[0].City;
            }
            if (!isDefined(tempData.homePincode)) {
                tempData.homePincode = userOriginalData[0].homePincode;
            }
            if (isDefined(userDataObj.CountryCode)) {
                condition = {
                    country: tempData.homeCountry,
                    state: tempData.homeState,
                    city: tempData.homeCity,
                    countryCode: userDataObj.CountryCode,
                };
            } else {
                condition = {
                    country: tempData.homeCountry,
                    state: tempData.homeState,
                    city: tempData.homeCity,
                };
            }
            updateValuesForAddressMaster = {
                home: {
                    Address: tempData.homeAddress,
                    CityName: tempData.homeCity,
                    StateName: tempData.homeState,
                    CountryName: tempData.homeCountry,
                    PinCode: tempData.homePincode,
                },
            };

            // await getIdFromTable(region, condition).then(async (regionRes) => {
            //     let tempRegionId = "";
            //     if (regionRes.length > 0) {
            //         tempRegionId = regionRes[0].dataValues.id;
            //     } else {
            //         await region.create(condition).then((respInsert) => {
            //             if (respInsert) {
            //                 tempRegionId = respInsert.dataValues.id;
            //             }
            //         });
            //     }
            //     updateValuesForAddressMaster = {
            //         home: {
            //             Address: tempData.homeAddress.toUpperCase(),
            //             CityName: tempData.homeCity.toUpperCase(),
            //             StateName: tempData.homeState.toUpperCase(),
            //             CountryName: tempData.homeCountry.toUpperCase(),
            //             PinCode: tempData.homePincode.toUpperCase(),
            //             regionId: tempRegionId,
            //         },
            //     };
            // });
        }

        // if (isDefined(userDataObj.officeAddressObj)) {
        //     tempData = userDataObj.officeAddressObj;
        //     let tempRegionId = 0;
        //     let addressId = 0;
        //     if (!isDefined(tempData.officeAddress)) {
        //         tempData.officeAddress = userOriginalData[0].officeAddress;
        //     }
        //     if (!isDefined(tempData.officeCountry)) {
        //         tempData.officeCountry = userOriginalData[0].officeCountry;
        //     }
        //     if (!isDefined(tempData.officeAddress)) {
        //         tempData.officeAddress = userOriginalData[0].officeAddress;
        //     }
        //     if (!isDefined(tempData.officeCity)) {
        //         tempData.officeCity = userOriginalData[0].officeCity;
        //     }
        //     if (!isDefined(tempData.officeState)) {
        //         tempData.officeState = userOriginalData[0].officeState;
        //     }
        //     if (!isDefined(tempData.officePincode)) {
        //         tempData.officePincode = userOriginalData[0].officePincode;
        //     }
        //     if (!isDefined(userDataObj.officePhone1)) {
        //         tempData.Phone1 = userOriginalData[0].officePhone1;
        //     } else {
        //         tempData.Phone1 = userDataObj.officePhone1;
        //     }
        //     condition = {
        //         country: tempData.officeCountry.toUpperCase(),
        //         state: tempData.officeState.toUpperCase(),
        //         city: tempData.officeCity.toUpperCase(),
        //     };
        //
        //     await getIdFromTable(region, condition).then(async (regionRes) => {
        //         if (regionRes.length > 0) {
        //             tempRegionId = regionRes[0].dataValues.id;
        //         } else {
        //             await region.create(condition).then((respInsert) => {
        //                 if (respInsert) {
        //                     tempRegionId = respInsert.dataValues.id;
        //                 } else {
        //                 }
        //             });
        //         }
        //         if (tempRegionId !== 0) {
        //             condition = {
        //                 Address: tempData.officeAddress.toUpperCase(),
        //                 CountryName: tempData.officeCountry.toUpperCase(),
        //                 StateName: tempData.officeState.toUpperCase(),
        //                 CityName: tempData.officeCity.toUpperCase(),
        //                 PinCode: tempData.officePincode,
        //                 regionId: tempRegionId,
        //
        //                 Phone1: tempData.Phone1,
        //             };
        //             await getIdFromTable(addressMaster, condition).then(async (res) => {
        //                 if (res.length !== 0) {
        //                     addressId = res[0].dataValues.AddressId;
        //                 } else {
        //                     await getIdFromTable(addressMaster, "").then(async (maxIdRes) => {
        //                         // console.log(maxIdRes[maxIdRes.length-1].dataValues.AddressId);
        //                         addressId =
        //                             maxIdRes[maxIdRes.length - 1].dataValues.AddressId + 1;
        //                     });
        //                     condition = { ...condition, AddressId: addressId };
        //                     await addressMaster
        //                         .create(condition)
        //                         .then((respInsert) => {
        //                             if (respInsert) {
        //                                 addressId = respInsert.dataValues.AddressId;
        //                             }
        //                         })
        //                         .catch((err) => {
        //                             console.log(err);
        //                         });
        //                 }
        //             });
        //         }
        //         if (addressId !== 0) {
        //             updateValuesForMemberMaster = {
        //                 ...updateValuesForMemberMaster,
        //                 OfficeAddId: addressId,
        //             };
        //         }
        //     });
        // }
        //
        // if (isDefined(userDataObj.officePhone1)) {
        //     if (isDefined(userDataObj.officeAddressObj)) {
        //         tempData = userDataObj.officeAddressObj;
        //         let tempRegionId = 0;
        //         let addressId = 0;
        //         if (!isDefined(tempData.officeAddress)) {
        //             tempData.officeAddress = userOriginalData[0].officeAddress;
        //         }
        //         if (!isDefined(tempData.officeCountry)) {
        //             tempData.officeCountry = userOriginalData[0].officeCountry;
        //         }
        //         if (!isDefined(tempData.officeAddress)) {
        //             tempData.officeAddress = userOriginalData[0].officeAddress;
        //         }
        //         if (!isDefined(tempData.officeCity)) {
        //             tempData.officeCity = userOriginalData[0].officeCity;
        //         }
        //         if (!isDefined(tempData.officeState)) {
        //             tempData.officeState = userOriginalData[0].officeState;
        //         }
        //         if (!isDefined(tempData.officePincode)) {
        //             tempData.officePincode = userOriginalData[0].officePincode;
        //         }
        //
        //         condition = {
        //             country: tempData.officeCountry.toUpperCase(),
        //             state: tempData.officeState.toUpperCase(),
        //             city: tempData.officeCity.toUpperCase(),
        //         };
        //
        //         await getIdFromTable(region, condition).then(async (regionRes) => {
        //             if (regionRes.length > 0) {
        //                 tempRegionId = regionRes[0].dataValues.id;
        //             } else {
        //                 await region.create(condition).then((respInsert) => {
        //                     if (respInsert) {
        //                         tempRegionId = respInsert.dataValues.id;
        //                     } else {
        //                     }
        //                 });
        //             }
        //             if (tempRegionId !== 0) {
        //                 condition = {
        //                     Address: tempData.officeAddress.toUpperCase(),
        //                     CountryName: tempData.officeCountry.toUpperCase(),
        //                     StateName: tempData.officeState.toUpperCase(),
        //                     CityName: tempData.officeCity.toUpperCase(),
        //                     PinCode: tempData.officePincode,
        //                     regionId: tempRegionId,
        //                 };
        //                 await getIdFromTable(addressMaster, condition).then(async (res) => {
        //                     if (res.length !== 0) {
        //                         addressId = res[0].dataValues.AddressId;
        //                     } else {
        //                         await getIdFromTable(addressMaster, "").then(
        //                             async (maxIdRes) => {
        //                                 // console.log(maxIdRes[maxIdRes.length-1].dataValues.AddressId);
        //                                 addressId =
        //                                     maxIdRes[maxIdRes.length - 1].dataValues.AddressId + 1;
        //                             }
        //                         );
        //                         condition = { ...condition, AddressId: addressId };
        //                         await addressMaster
        //                             .create(condition)
        //                             .then((respInsert) => {
        //                                 if (respInsert) {
        //                                     addressId = respInsert.dataValues.AddressId;
        //                                 }
        //                             })
        //                             .catch((err) => {
        //                                 console.log(err);
        //                             });
        //                     }
        //                 });
        //             }
        //             if (addressId !== 0) {
        //                 updateValuesForAddressMaster = {
        //                     ...updateValuesForAddressMaster,
        //                     OfficeAddId: addressId,
        //                     Phone1: userDataObj.officePhone1,
        //                 };
        //             }
        //         });
        //     } else {
        //         tempData = {
        //             officeState: userOriginalData[0].officeState,
        //             officePincode: userOriginalData[0].officePincode,
        //             officeAddress: userOriginalData[0].officeAddress,
        //             officeCountry: userOriginalData[0].officeCountry,
        //             officeCity: userOriginalData[0].officeCity,
        //         };
        //         condition = {
        //             Address: tempData.officeAddress.toUpperCase(),
        //             CountryName: tempData.officeCountry.toUpperCase(),
        //             StateName: tempData.officeState.toUpperCase(),
        //             CityName: tempData.officeCity.toUpperCase(),
        //             PinCode: tempData.officePincode,
        //         };
        //         await getIdFromTable(addressMaster, condition).then(async (res) => {
        //             if (res.length !== 0) {
        //                 addressId = res[0].dataValues.AddressId;
        //                 updateValuesForAddressMaster = {
        //                     ...updateValuesForAddressMaster,
        //                     OfficeAddId: addressId,
        //                     Phone1: userDataObj.officePhone1,
        //                 };
        //             }
        //         });
        //     }
        // }

        if (updateValuesForAddressMaster !== {} && addressId > 0) {
            condition = {
                AddressId: { [Op.eq]: `${addressId}` },
            };

            await updateTableValue(
                addressMaster,
                updateValuesForAddressMaster.home,
                condition
            ).then((res) => {});
        }

        if (updateValueForFamilyMaster !== {} && familyId > 0) {
            condition = {
                FamilyId: { [Op.eq]: `${familyId}` },
            };
            await updateTableValue(
                familyMaster,
                updateValueForFamilyMaster,
                condition
            ).then(() => {});
        }
        if (updateValuesForMemberMaster !== {} && memberId > 0) {
            condition = {
                VoterId: { [Op.eq]: `${memberId}` },
            };
            await updateTableValue(
                voterMaster,
                updateValuesForMemberMaster,
                condition
            ).then(() => {
                // console.log(res);
            });
        }
        // await getUserRole(memberId).then((newRole) => {
        //     if (newRole) {
        //         role = newRole;
        //     }
        // });
        return resolve({ status: true, message });
    });
};
const changeUserPassword = (memberId, oldPwd, newPwd, newToken) => {
    let condition = null;
    return new Promise(async (resolve) => {
        condition = {
            VoterId: { [Op.eq]: memberId },
            Password: { [Op.eq]: oldPwd },
        };
        const members = await voterMaster.findOne({
            where: condition,
            attributes: ["FirstName", "MiddleName"],
        });
        if (members === null) {
            return resolve({
                status: false,
                message: "Please enter correct old password",
            });
        }
        voterMaster
            .update({ Password: newPwd }, { where: { VoterId: memberId } })
            .then((updateRes) => {
                if (updateRes) {
                    return resolve({
                        status: true,
                        message: "Password Changed Successfully",
                    });
                }
                return resolve({
                    status: false,
                    message: "Failed To Change Password",
                });
            });
    });
};
const getEventInformation = () =>{
    return new Promise((resolve)=>{
        const conditionForNotificationType = {
            TypeName: { [Op.like]: 'EVENT' },
        };
        try{
            notificationMaster.findAll({
                include:
                    [
                        {
                            model: notificationTypeMaster,
                            where:conditionForNotificationType
                        },
                        {
                            model: notificationDetails,
                        },
                    ]
            }).then(async (res)=>{
                if(res){
                    let tempArray = []
                    await res.map((data,item)=>{
                        let temp = data.dataValues
                        tempArray.push({
                            Description:temp.Description,
                            Title:temp.Title,
                            MessageDate:moment(temp.NotificationDetail.dataValues.FromDate).format("YYYY-MM-DD hh:mm:ss A"),
                            Images:temp.NotificationImage,
                            Pdf:temp.Attachments,
                            Location:temp.NotificationDetail.dataValues.Location,
                            FromDate:moment(temp.NotificationDetail.dataValues.FromDate).format("YYYY-MM-DD"),
                            ToDate:moment(temp.NotificationDetail.dataValues.ToDate).format("YYYY-MM-DD"),
                            StartTime:moment(temp.NotificationDetail.dataValues.FromDate).format("hh:mm:ss A"),
                            EndTime:moment(temp.NotificationDetail.dataValues.ToDate).format("hh:mm:ss A"),
                            Organizer:temp.NotificationDetail.dataValues.Organizer,
                        })
                    })
                    resolve(tempArray)
                } else {
                    resolve(false)
                }
            }).catch((err)=>{
                console.log(err);
                resolve(false)
            })
        }catch(ex){
            resolve(false)

        }

    })
}

const sortData = (sortingCrieteria, sortingOrder) => {
    return new Promise(async (resolve) => {
        const tempSortingCrieteriaArray = [];
        const sortingCrieteriaArray = [];
        let tempValue = null;
        let tempSortingOrder = null;
        const condition = {
            MiddleName: { [Op.ne]: null },
            FirstName: { [Op.ne]: null },
            LastName: { [Op.ne]: null },
        };

        if (isDefined(sortingCrieteria.FirstName)) {
            tempValue = sortingCrieteria.FirstName;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: ["FirstName", tempSortingOrder],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });
        }
        if (isDefined(sortingCrieteria.MiddleName)) {
            tempValue = sortingCrieteria.MiddleName;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: ["MiddleName", tempSortingOrder],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });
            // tempSortingCrieteriaArray.push(["MiddleName", sortingOrder]);
        }
        if (isDefined(sortingCrieteria.LastName)) {
            tempValue = sortingCrieteria.LastName;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: ["LastName", tempSortingOrder],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });

            // tempSortingCrieteriaArray.push(["LastName", sortingOrder]);
        }
        if (isDefined(sortingCrieteria.MaritalStatus)) {
            tempValue = sortingCrieteria.MaritalStatus;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: ["MaritalStatus", tempSortingOrder],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });
            // tempSortingCrieteriaArray.push(["MaritalStatus", sortingOrder]);
        }
        if (isDefined(sortingCrieteria.NativePlace)) {
            tempValue = sortingCrieteria.NativePlace;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: [
                    sequelize.col("FamilyMaster->NativePlaceMaster.Name"),
                    tempSortingOrder,
                ],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });
        }
        if (isDefined(sortingCrieteria.DOB)) {
            tempValue = sortingCrieteria.DOB;
            tempSortingOrder =
                tempValue.substring(tempValue.indexOf("#") + 1, tempValue.length) ===
                "0"
                    ? "DESC"
                    : "ASC";
            tempSortingCrieteriaArray.push({
                value: ["DOB", tempSortingOrder],
                sequenceNo: parseInt(tempValue.substring(0, tempValue.indexOf("#"))),
            });
        }
        if (tempSortingCrieteriaArray.length === 0) {
            return resolve(false);
        }
        tempSortingCrieteriaArray.sort(function (a, b) {
            const keyA = parseInt(a.sequenceNo);
            const keyB = parseInt(b.sequenceNo);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        await tempSortingCrieteriaArray.map((item, index) => {
            sortingCrieteriaArray.push(item.value);
        });
        await memberMaster
            .findAll({
                attributes: [
                    "MemberId",
                    "FirstName",
                    "MiddleName",
                    "LastName",
                    "Email",
                    "Mobile",
                    "DOB",
                    "AadhaarNo",
                    "MaritalStatus",
                    "BloodGroup",
                    "Zodiac",
                    "Gender",
                    "Studies",
                    "MarriageDate",
                    "ProfileImage",
                    "IsDaughterFamily",
                    "SpouseId",
                ],
                where: condition,
                order: sortingCrieteriaArray,
                include: [
                    {
                        attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
                        model: memberMaster,
                        as: "MotherEntry",
                    },
                    {
                        attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
                        model: memberMaster,
                        as: "SpouseEntry",
                    },
                    {
                        attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
                        model: memberMaster,
                        as: "FatherEntry",
                    },
                    {
                        attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
                        model: memberMaster,
                        as: "FatherInLawDetail",
                    },
                    {
                        attributes: ["MemberId", "FirstName", "MiddleName", "LastName"],
                        model: memberMaster,
                        as: "MotherInLawDetail",
                    },
                    {
                        attributes: ["Name"],
                        model: occupationMaster,
                        as: "OccupationDetail",
                    },
                    {
                        model: addressMaster,
                        as: "OfficeAddressDetail",
                    },
                    {
                        attributes: ["FamilyId"],
                        model: familyMaster,
                        include: [
                            {
                                model: addressMaster,
                                include: [{ model: region, attributes: ["countryCode"] }],
                            },
                            {
                                attributes: ["Name"],
                                model: nativeMaster,
                            },
                        ],
                    },
                ],
            })
            .then((res) => {
                if (res && res.length > 0) {
                    return resolve(res);
                }
                return resolve(false);
            })
            .catch((err) => {
                return resolve(false);
            });
    });
};
const getSpecificMemberDetail = async (memberId) => {
    // const tempMemberArray = [];
    const outputMemberArray = [];
    let condition = {
        VoterId: { [Op.eq]: memberId },
    };

    await voterMaster
        .findAll({
            attributes: [
                "VoterId",
                "FirstName",
                "MiddleName",
                "LastName",
                "Email",
                "Mobile",
                "DOB",
                "AadhaarNo",
                "MaritalStatus",
                "BloodGroup",
                "Zodiac",
                "Gender",
                "Studies",
                "MarriageDate",
                "ProfileImage",
                "SpouseId",
            ],
            where: condition,

            include: [
                {
                    attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                    model: voterMaster,
                    as: "MotherEntry",
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
                    as: "SpouseEntry",
                },
                {
                    attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                    model: voterMaster,
                    as: "MotherInLawDetail",
                },
                {
                    attributes: ["Name"],
                    model: occupationMaster,
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


            if (res.length > 0) {
                condition = {
                    VoterId: {
                        [Op.eq]: res[0].dataValues.FamilyMaster.dataValues.HeadId,
                    },
                };
                let tempHeadName = "-"
                await voterMaster.findOne({ where: condition }).then((headName) => {
                    if (headName) {
                        const head = headName.dataValues;
                        tempHeadName = `${head.FirstName} ${head.MiddleName} ${head.LastName}`;
                    }
                }).catch((err)=>{
                    console.log("--err",err)
                });
                const tempData = res[0].dataValues;
                let outputObj = {};
                outputObj = {
                    ...outputObj,
                    Name: `${checkForValue(tempData.FirstName)} ${checkForValue(
                        tempData.MiddleName
                    )} ${checkForValue(tempData.LastName)}`,
                    Email: checkForValue(tempData.Email),
                    FatherInLawId:
                        tempData.FatherInLawDetail && tempData.FatherInLawDetail != null
                            ? createName(tempData.FatherInLawDetail)
                            : "-",
                    SpouseId:
                        tempData.SpouseEntry && tempData.SpouseEntry != null
                            ? createName(tempData.SpouseEntry)
                            : "-",
                    MotherInLawId:
                        tempData.MotherInLawDetail && tempData.MotherInLawDetail != null
                            ? createName(tempData.MotherInLawDetail)
                            : "-",
                    Mobile: checkForValue(tempData.Mobile),
                    DOB: checkForValue(tempData.DOB),
                    MotherName:
                        tempData.MotherEntry && tempData.MotherEntry != null
                            ? createName(tempData.MotherEntry)
                            : "-",
                    AadhaarNo: checkForValue(tempData.AadhaarNo),
                    BloodGroup: checkForValue(tempData.BloodGroup),
                    Zodiac: checkForValue(tempData.Zodiac),
                    Gender: checkForValue(tempData.Gender),
                    Studies: checkForValue(tempData.Studies),
                    MaritalStatuses: checkForValue(tempData.MaritalStatus),
                    MarriageDate: checkForValue(tempData.MarriageDate),
                    homeAddress:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.AddressMaster &&
                        tempData.FamilyMaster.AddressMaster != null
                            ? checkForValue(tempData.FamilyMaster.AddressMaster.Address)
                            : "-",
                    NativePlace:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.NativePlaceMaster &&
                        tempData.FamilyMaster.NativePlaceMaster != null
                            ? checkForValue(tempData.FamilyMaster.NativePlaceMaster.Name)
                            : "-",
                   City:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.AddressMaster &&
                        tempData.FamilyMaster.AddressMaster != null
                            ? checkForValue(tempData.FamilyMaster.AddressMaster.CityName)
                            : "-",
                    State:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.AddressMaster &&
                        tempData.FamilyMaster.AddressMaster != null
                            ? checkForValue(tempData.FamilyMaster.AddressMaster.StateName)
                            : "-",
                    Country:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.AddressMaster &&
                        tempData.FamilyMaster.AddressMaster != null
                            ? checkForValue(tempData.FamilyMaster.AddressMaster.CountryName)
                            : "-",
                    Occupations:
                        tempData.OccupationMaster && tempData.OccupationMaster != null
                            ? checkForValue(tempData.OccupationMaster.Name)
                            : "-",

                    FamilyHeadName: tempHeadName,
                    homePincode:
                        tempData.FamilyMaster &&
                        tempData.FamilyMaster != null &&
                        tempData.FamilyMaster.AddressMaster &&
                        tempData.FamilyMaster.AddressMaster != null
                            ? checkForValue(tempData.FamilyMaster.AddressMaster.PinCode)
                            : "-",
                    fatherName:
                        tempData.FatherEntry && tempData.FatherEntry != null
                            ? createName(tempData.FatherEntry)
                            : "-",
                    ProfileImage: checkForValue(tempData.ProfileImage),
                };
                console.log(outputObj.Occupations)
                outputMemberArray.push(outputObj);
                return { Data: outputMemberArray, next_endpoint: nextUrl };
            }
        })
        .catch((err) => {
            return { Data: outputMemberArray, next_endpoint: nextUrl };
        });
    if (outputMemberArray.length !== 0) {
        return { Data: outputMemberArray, next_endpoint: nextUrl };
    }

    return { Data: outputMemberArray, next_endpoint: nextUrl };
};
// const getFamilyTreeData = (familyId) =>{
//     return new Promise((resolve)=>{
//         const condition = { FamilyId: { [Op.eq]: `${familyId}`}};
//         voterMaster.findAll(
//             {
//                 where:condition,
//                 include:[ {
//                 model: familyRoleMaster,
//             },]}).then((res)=>{
//             if(res){
//                 resolve(res)
//             } else {
//                 resolve(false)
//             }
//         }).catch((err)=>{
//             resolve(false)
//         })
//     })
// }

const getFamilyTreeData = (familyId) =>{
    return new Promise((resolve)=>{
        const condition = { FamilyId: { [Op.eq]: `${familyId}`}};
        voterMaster.findAll(
            {
                order: [["Age", "DESC"]],
                where:condition,
                include:[ {
                    attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                    model: voterMaster,
                    as: "FatherEntry",
                },
                    {
                        attributes: ["VoterId", "FirstName", "MiddleName", "LastName"],
                        model: voterMaster,
                        as: "SpouseEntry",
                    },]
            }).then((res)=>{
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
const checkAddressExist = (address) =>{
    return new Promise(async (resolve)=>{
        let condition = {
            Address: { [Op.eq]: address },
        };
        let addressObj = null
        await getBoothDataFromBoothId().then((boothData)=>{
            if(boothData){
                addressObj = {
                    CityOrVillageName:boothData.dataValues.WardCity,
                    DistrictName:boothData.dataValues.DistrictName,
                    StateName:boothData.dataValues.WardState,
                    CountryName:"INDIA",
                    BoothId:boothData.dataValues.WardId
                }
            }
        })
        addressMaster.findOne(({where:condition})).then((res)=>{
            if(res){
                 condition = {
                    ResidenceAddressId: { [Op.eq]: res.dataValues.AddressId },
                    };
                 familyMaster.findOne({where:condition}).then(async (isFamilyExist)=>{
                    if(isFamilyExist){
                        resolve(isFamilyExist.dataValues.FamilyId)
                    } else{
                        familyMaster.create({
                            ResidenceAddressId:res.dataValues.AddressId
                        }).then((isNewFamilyCreated)=>{
                            if(isNewFamilyCreated){
                                resolve(isNewFamilyCreated.dataValues.FamilyId)
                            }
                        }).catch((err)=>{
                            console.log("new family err-",err)
                            resolve(false)
                        })
                    }
                })

            } else {
                addressObj = {...addressObj,Address:address}
                addressMaster.create(addressObj).then((isNewAddressCreated)=>{
                    if(isNewAddressCreated){
                        familyMaster.create({ResidenceAddressId:isNewAddressCreated.dataValues.AddressId}).then((isNewFamilyCreated)=>{
                            if(isNewFamilyCreated){
                                resolve(isNewFamilyCreated.dataValues.FamilyId)
                            } else {
                                resolve(false)
                            }
                        }).catch((err)=>{
                            console.log("new family creating erro--",err)
                        })
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    console.log("new address creating error--",err)
                })
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const getBoothDataFromBoothId = (boothId) =>{
    let condition = {
        WardCode: { [Op.like]: "W-101" },
    };

    return new Promise((resolve)=>{
        wardMaster.findOne({where:condition}).then((res)=>{
            if(res){
                resolve(res)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err-",err)
            resolve(false)
        })
    })
}
const getAddressID = (address)=>{
    return new Promise((resolve)=>{
        let condition = {Address: { [Op.eq]: address.trim() }};
        let insAddressObj = {
            "Address":address,
            "CityOrVillageName":"SURAT",
            "DistrictName":"SURAT",
            "StateName":"GUJARAT",
            "CountryName":"INDIA",
            "PinCode":"395010"
        }
        addressMaster.findOne({where:condition}).then((isAddressAvailable)=>{
            if(isAddressAvailable){
                return resolve(isAddressAvailable.dataValues.AddressId)
            } else {
                addressMaster.create(insAddressObj).then((isNewAddressCreated)=>{
                    if(isNewAddressCreated){
                        return resolve(isNewAddressCreated.dataValues.AddressId)
                    } else {
                        return resolve(null)
                    }
                }).catch((err)=>{
                    return resolve(null)
                })
            }
        }).catch((err)=>{
            return resolve(null)
        })
    })
}
const getFamilyId = (addressId) =>{
    return new Promise((resolve)=>{
        if(addressId === null){
            return resolve(null)
        } else {
            let condition = {ResidenceAddressId: { [Op.eq]: addressId }};
            let insFamilyObj = {
                "ResidenceAddressId":addressId,
            }
            familyMaster.findOne({where:condition}).then((isFamilyAvailable)=>{
                if(isFamilyAvailable){
                    return resolve(isFamilyAvailable.dataValues.FamilyId)
                } else {
                    familyMaster.create(insFamilyObj).then((isNewFamilyCreated)=>{
                        if(isNewFamilyCreated){
                            return resolve(isNewFamilyCreated.dataValues.FamilyId)
                        } else {
                            return resolve(null)
                        }
                    }).catch((err)=>{
                        return resolve(null)
                    })
                }
            }).catch((err)=>{
                return resolve(null)
            })
        }
    })
}
const getParentId = (middleName,age,familyId,needToCheckAge) =>{
    return new Promise((resolve)=>{
        let condition = {FirstName: { [Op.like]: `%${middleName.trim()}%` },};
        voterMaster.findAll({where:condition}).then((isParentDataAvailable)=>{
            if(isParentDataAvailable){
                if(isParentDataAvailable.length ===0){
                    return resolve(false)
                }
                else if(isParentDataAvailable.length === 1){
                    if(isParentDataAvailable[0].dataValues.FamilyId === familyId){
                        if(needToCheckAge && (isParentDataAvailable[0].dataValues.Age - age) >=15){
                            resolve(isParentDataAvailable[0].dataValues.VoterId)
                        } else {
                            resolve(isParentDataAvailable[0].dataValues.VoterId)
                        }
                    } else {
                        resolve(false)
                    }
                } else {
                    isParentDataAvailable.map((parentListData)=>{
                        if(parentListData.dataValues.FamilyId === familyId){
                            if(needToCheckAge && (parentListData.dataValues.Age - age) >=15){
                                return resolve(parentListData.dataValues.VoterId)
                            } else {
                                return resolve(isParentDataAvailable[0].dataValues.VoterId)
                            }
                        } else {
                            resolve(false)
                        }
                    })
                }
            } else {

                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const checkMemberExistAndEnterDetails = (obj) =>{
    return new Promise((resolve)=>{
        let condition = {FirstName: { [Op.like]: `%${obj.FirstName.trim()}%` },
            MiddleName: { [Op.like]: `%${obj.MiddleName.trim()}%` },
            Age: { [Op.eq]: `${obj.Age}` },
            Gender: { [Op.eq]: `${obj.Gender}` },
            FamilyId: { [Op.eq]: `${obj.FamilyId}` },
        };

        voterMaster.findOne({where:condition}).then((isMemberAlreadyExist)=>{
            if(isMemberAlreadyExist){
                condition = {VoterId: { [Op.eq]: `${isMemberAlreadyExist.dataValues.VoterId}` }};
                voterMaster.update(obj,{where:condition}).then((isMemberUpdated)=>{
                    if(isMemberUpdated){
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    resolve(false)
                })
                resolve(true)
            } else {
                voterMaster.create(obj).then((isNewMemberCreated)=>{
                    if(isNewMemberCreated){
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    resolve(false)
                })
            }
        }).catch((err)=>{
            console.log("err-",err)
            resolve(false)
        })
    })
}
const insertBulkDataInDb = (dataArray,boothId) =>{
    console.log(dataArray)
    const tempArray=[
        // {"VoterVotingId":"RJ/25/194/078352","FirstName":"Brijmohan","MiddleName":"Ratanlal","Relation":"Father","Age":"48","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
        // {"VoterVotingId":"MTW1184191","FirstName":"Pawan","MiddleName":"Brijmohan","Relation":"Husband","Age":"50","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
        // {"VoterVotingId":"ABZBO917542","FirstName":"Vinod","MiddleName":"Omprakash","Relation":"Father","Age":"41","Gender":"Male","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
        // {"VoterVotingId":"AZB0917534","FirstName":"Munni Devi","MiddleName":"Vinod","Relation":"Husband","Age":"38","Gender":"Female","RoomNo":"1","Address":"Bus stand, Khatukhurd"},
        // {"VoterVotingId":"AZB0800276","FirstName":"Sugani Devi","MiddleName":"Omprakash","Relation":"Husband","Age":"70","Gender":"Female","RoomNo":"2","Address":"Bus stand, Khatukhurd"},
        // {"VoterVotingId":"RJ/25/194/078525","FirstName":"Sundar","MiddleName":"Bheruram","Relation":"Husband","Age":"81","Gender":"Female","RoomNo":"2","Address":"Bus stand, Khatukhurd"}
        {"VoterVotingId":"RJ/25/194/078533","FirstName":"Mukesh","MiddleName":"Sanjay","Relation":"Father","Age":"23","Gender":"male","RoomNo":"2","Address":"Bus stand, Khatukhurd"},
        {"VoterVotingId":"RJ/25/194/078534","FirstName":"Sanjay","MiddleName":"Manekchand","Relation":"Father","Age":"45","Gender":"male","RoomNo":"2","Address":"Bus stand, Khatukhurd"},
        {"VoterVotingId":"RJ/25/194/078535","FirstName":"Manekchand","MiddleName":"Fhoolchand","Relation":"Father","Age":"78","Gender":"male","RoomNo":"2","Address":"Bus stand, Khatukhurd"}
    ]
    let updateIndex = 0;
    return new Promise((resolve)=>{
        dataArray.map((memberDetail,outSideIndex)=>{
            if(isDefined(memberDetail.HouseNo) && isDefined(memberDetail.Address) && isDefined(memberDetail.Gender) &&
           isDefined(memberDetail.Age) && isDefined(memberDetail.Relationship) && isDefined(memberDetail.Name) && isDefined(memberDetail.MiddleName)
           ){
               let tempAddress = memberDetail.HouseNo.toString().trim()+","+memberDetail.Address;
               let condition = {Address: { [Op.eq]: tempAddress.trim() }};
               let AddressId = null;
               let FamilyId = null;
               let ParentId = null;
               getAddressID(tempAddress).then((responseAddressId)=>{
                   AddressId = responseAddressId;
                   getFamilyId(AddressId).then((responseFamilyId)=>{
                       FamilyId = responseFamilyId;
                       getParentId(memberDetail.MiddleName,memberDetail.Age,FamilyId,memberDetail.Relationship.toLowerCase() === 'father'?true:false).then((isParentAvailbel)=>{
                           if(isParentAvailbel){
                               ParentId = isParentAvailbel;
                           }
                           let insMemberObj = {
                               FirstName:memberDetail.Name,
                               MiddleName:memberDetail.MiddleName,
                               Age:memberDetail.Age,
                               Gender:memberDetail.Gender,
                               VoterVotingId:memberDetail.VoterId,
                               FamilyId:FamilyId,
                               BoothId:boothId
                           }
                           if(memberDetail.Relationship.toLowerCase() === 'father'){
                               insMemberObj = {...insMemberObj,FatherId:ParentId}
                           } else {
                               insMemberObj = {...insMemberObj,SpouseId:ParentId}
                           }
                           checkMemberExistAndEnterDetails(insMemberObj).then((isMemberCreated)=>{
                               updateIndex = updateIndex + 1;
                               if(updateIndex >= tempArray.length) {
                                   resolve(true)
                               }
                           })
                       })
                   })
               })
           }
        })
    })
}
// const insertBulkDataInDb = (dataArray) =>{
//     return new Promise(async (resolve)=>{
//         const allDataMembers = dataArray
//         dataArray = await loadash.groupBy(dataArray, "address");
//         let addressWiseDataArray = []
//         await Object.entries(dataArray).forEach(async ([key, value]) => {
//             addressWiseDataArray.push({"address":key,"addressData":value})
//         });
//         let tempBoothId = "W-101"
//         let addressObj = {}
//
//         // await getBoothDataFromBoothId(tempBoothId).then((boothData)=>{
//         //      if(boothData){
//         //           addressObj = {
//         //              CityOrVillageName:boothData.dataValues.WardCity,
//         //              DistrictName:boothData.dataValues.DistrictName,
//         //              StateName:boothData.dataValues.WardState,
//         //              CountryName:"INDIA",
//         //               BoothId:boothData.dataValues.WardId
//         //          }
//         //      }
//         //  })
//         // console.log(addressObj)
//         let AddressId = 1;
//         let insertMemberObj = null
//         // await addressWiseDataArray.map((address)=>{
//         //     checkAddressExist(address.address).then(async (isAddressExist)=>{
//         //         if(isAddressExist){
//         //             AddressId = isAddressExist
//         //             let condition = {
//         //                 ResidenceAddressId: { [Op.eq]: AddressId },
//         //             };
//         //                let FamilyId = 1;
//         //                await familyMaster.findOne({where:condition}).then(async (isFamilyExist)=>{
//         //                    if(isFamilyExist){
//         //                        FamilyId = isFamilyExist.dataValues.FamilyId
//         //                    } else{
//         //                        await familyMaster.create({
//         //                            ResidenceAddressId:AddressId
//         //                        }).then((isNewFamilyCreated)=>{
//         //                            if(isNewFamilyCreated){
//         //                                FamilyId = isNewFamilyCreated.dataValues.FamilyId
//         //                            }
//         //                        }).catch((err)=>{
//         //                            // console.log("new family err-",err)
//         //                        })
//         //                    }
//         //                })
//         //             await address.addressData.map(async (memberData)=>{
//         //                    let isMemberParentExistInDb = false
//         //                    condition = {
//         //                        FirstName: { [Op.like]: `%${memberData.middleName.trim()}%` },
//         //                    };
//         //                    let tempFamilyId = FamilyId
//         //                    let tempParentId = 0
//         //                    await voterMaster.findAll({attributes:['FamilyId','VoterId'],where:condition}).then(async (isParentExist)=>{
//         //                        if(isParentExist.length > 0){
//         //                            if(isParentExist.length === 1){
//         //                                tempFamilyId = isParentExist[0].dataValues.FamilyId
//         //                                tempParentId = isParentExist[0].dataValues.VoterId
//         //                            } else if(isParentExist.length>1) {
//         //                                await isParentExist.map((parentData)=>{
//         //                                    condition = {
//         //                                        FamilyId: { [Op.eq]: parentData.FamilyId },
//         //                                    };
//         //                                    familyMaster.findOne({where:condition,
//         //                                        include: [
//         //                                            {
//         //                                                model: addressMaster,
//         //                                            }]
//         //                                    }).then((parentAddressData)=>{
//         //                                        if(parentAddressData.Address.length >= memberData.address){
//         //                                            if(parentAddressData.Address.includes(memberData.address)){
//         //                                                tempFamilyId = parentData.FamilyId;
//         //                                                tempParentId = parentData.VoterId
//         //                                                return;
//         //                                            }
//         //                                        } else {
//         //                                            if(memberData.address.includes(parentAddressData.Address)){
//         //                                                tempFamilyId = parentData.FamilyId;
//         //                                                tempParentId = parentData.VoterId
//         //                                                return;
//         //                                            }
//         //                                        }
//         //                                    })
//         //                                })
//         //                            }
//         //                            insertMemberObj = {
//         //                                FirstName:memberData.name,
//         //                                MiddleName:memberData.middleName,
//         //                                DOB:memberData.dob,
//         //                                Gender:memberData.gender,
//         //                                VoterVotingId:memberData.voterVotingId,
//         //                                BoothId:addressObj.BoothId,
//         //                                FamilyId:tempFamilyId
//         //                            }
//         //                            if(parseInt(tempParentId) > 0){
//         //                                if(memberData.relation === 'father'){
//         //                                    insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//         //                                } else  {
//         //                                    insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//         //                                }
//         //                            }
//         //
//         //                            await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //                                if(isNewMemberCreated) {
//         //                                    console.log("New member added from here...")
//         //                                }
//         //                            }).catch((err)=>{
//         //                                // console.log("new member error from here..",err)
//         //                            })
//         //
//         //                            tempParentId = 0;
//         //                        } else {
//         //
//         //                            await allDataMembers.map(async (parentData,index)=>{
//         //                                if(parentData.voterVotingId !== memberData.voterVotingId){
//         //                                    if(parentData.name.includes(memberData.middleName)){
//         //                                        isMemberParentExistInDb = true
//         //                                        console.log("inside--",isMemberParentExistInDb)
//         //                                        let insertParentMemberObj = {
//         //                                            FirstName:parentData.name,
//         //                                            MiddleName:parentData.middleName,
//         //                                            DOB:parentData.dob,
//         //                                            Gender:parentData.gender,
//         //                                            VoterVotingId:parentData.voterVotingId,
//         //                                            BoothId:addressObj.BoothId,
//         //                                            FamilyId:tempFamilyId
//         //                                        }
//         //                                        await voterMaster.create(insertParentMemberObj).then(async (isParentInserted)=>{
//         //                                            if(isParentInserted) {
//         //                                                tempParentId = isParentInserted.dataValues.VoterId
//         //                                                insertMemberObj = {
//         //                                                    FirstName:memberData.name,
//         //                                                    MiddleName:memberData.middleName,
//         //                                                    DOB:memberData.dob,
//         //                                                    Gender:memberData.gender,
//         //                                                    VoterVotingId:memberData.voterVotingId,
//         //                                                    BoothId:addressObj.BoothId,
//         //                                                    FamilyId:tempFamilyId
//         //                                                }
//         //                                                if(parseInt(tempParentId) > 0){
//         //                                                    if(memberData.relation === 'father'){
//         //                                                        insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//         //                                                    } else  {
//         //                                                        insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//         //                                                    }
//         //                                                }
//         //                                                await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //                                                    if(isNewMemberCreated) {
//         //                                                        console.log("New member added...")
//         //                                                    }
//         //                                                }).catch((err)=>{
//         //                                                    // console.log("new member error",err)
//         //                                                })
//         //                                                tempParentId = 0;
//         //                                            }
//         //                                        }).catch((err)=>{
//         //                                            console.log("parent error",err)
//         //                                        })
//         //                                        return;
//         //                                    }
//         //                                }
//         //                            })
//         //                            if(!isMemberParentExistInDb){
//         //                                insertMemberObj = {
//         //                                    FirstName:memberData.name,
//         //                                    MiddleName:memberData.middleName,
//         //                                    DOB:memberData.dob,
//         //                                    Gender:memberData.gender,
//         //                                    VoterVotingId:memberData.voterVotingId,
//         //                                    BoothId:addressObj.BoothId,
//         //                                    FamilyId:FamilyId
//         //                                }
//         //                                await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //                                    if(isNewMemberCreated) {
//         //                                        console.log("New member added...")
//         //                                    }
//         //                                }).catch((err)=>{
//         //                                    // console.log("new member error",err)
//         //                                })
//         //                                isMemberParentExistInDb = false
//         //                            }
//         //
//         //                        }
//         //                    }).catch((err)=>{
//         //                        // console.log("err-",err)
//         //                    })
//         //                })
//         //
//         //         } else {
//         //             console.log("not exist")
//         //               let addressObjToInsert = {
//         //                   ...addressObj,
//         //                   Address:address.address
//         //               }
//         //               await addressMaster.create(addressObjToInsert).then((res)=>{
//         //                   if(res){
//         //                       AddressId = res.dataValues.AddressId
//         //                   }
//         //               }).catch((err)=>{
//         //                   // console.log(err)
//         //               })
//         //             let condition = {
//         //                 ResidenceAddressId: { [Op.eq]: AddressId },
//         //             };
//         //             console.log(condition)
//         //             let FamilyId = 1;
//         //             await familyMaster.findOne({where:condition}).then(async (isFamilyExist)=>{
//         //                 if(isFamilyExist){
//         //                     FamilyId = isFamilyExist.dataValues.FamilyId
//         //                 } else{
//         //                     console.log({ResidenceAddressId:AddressId})
//         //                     await familyMaster.create({
//         //                         ResidenceAddressId:AddressId
//         //                     }).then((isNewFamilyCreated)=>{
//         //                         if(isNewFamilyCreated){
//         //                             FamilyId = isNewFamilyCreated.dataValues.FamilyId
//         //                         }
//         //                         console.log("new family id-",FamilyId)
//         //                     }).catch((err)=>{
//         //                         console.log("new family err-",err)
//         //                     })
//         //                 }
//         //             })
//         //
//         //             // await address.addressData.map(async (memberData)=>{
//         //             //     let isMemberParentExistInDb = false
//         //             //     condition = {
//         //             //         FirstName: { [Op.like]: `%${memberData.middleName.trim()}%` },
//         //             //     };
//         //             //     let tempFamilyId = FamilyId
//         //             //     let tempParentId = 0
//         //             //     await voterMaster.findAll({attributes:['FamilyId','VoterId'],where:condition}).then(async (isParentExist)=>{
//         //             //         if(isParentExist.length > 0){
//         //             //             if(isParentExist.length === 1){
//         //             //                 tempFamilyId = isParentExist[0].dataValues.FamilyId
//         //             //                 tempParentId = isParentExist[0].dataValues.VoterId
//         //             //             } else if(isParentExist.length>1) {
//         //             //                 await isParentExist.map((parentData)=>{
//         //             //                     condition = {
//         //             //                         FamilyId: { [Op.eq]: parentData.FamilyId },
//         //             //                     };
//         //             //                     familyMaster.findOne({where:condition,
//         //             //                         include: [
//         //             //                             {
//         //             //                                 model: addressMaster,
//         //             //                             }]
//         //             //                     }).then((parentAddressData)=>{
//         //             //                         if(parentAddressData.Address.length >= memberData.address){
//         //             //                             if(parentAddressData.Address.includes(memberData.address)){
//         //             //                                 tempFamilyId = parentData.FamilyId;
//         //             //                                 tempParentId = parentData.VoterId
//         //             //                                 return;
//         //             //                             }
//         //             //                         } else {
//         //             //                             if(memberData.address.includes(parentAddressData.Address)){
//         //             //                                 tempFamilyId = parentData.FamilyId;
//         //             //                                 tempParentId = parentData.VoterId
//         //             //                                 return;
//         //             //                             }
//         //             //                         }
//         //             //                     })
//         //             //                 })
//         //             //             }
//         //             //             insertMemberObj = {
//         //             //                 FirstName:memberData.name,
//         //             //                 MiddleName:memberData.middleName,
//         //             //                 DOB:memberData.dob,
//         //             //                 Gender:memberData.gender,
//         //             //                 VoterVotingId:memberData.voterVotingId,
//         //             //                 BoothId:addressObj.BoothId,
//         //             //                 FamilyId:tempFamilyId
//         //             //             }
//         //             //             if(parseInt(tempParentId) > 0){
//         //             //                 if(memberData.relation === 'father'){
//         //             //                     insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//         //             //                 } else  {
//         //             //                     insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//         //             //                 }
//         //             //             }
//         //             //
//         //             //             await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //             //                 if(isNewMemberCreated) {
//         //             //                     console.log("New member added from here...")
//         //             //                 }
//         //             //             }).catch((err)=>{
//         //             //                 // console.log("new member error from here..",err)
//         //             //             })
//         //             //
//         //             //             tempParentId = 0;
//         //             //         } else {
//         //             //             await allDataMembers.map(async (parentData,index)=>{
//         //             //                 if(parentData.voterVotingId !== memberData.voterVotingId){
//         //             //                     if(parentData.name.includes(memberData.middleName)){
//         //             //                         isMemberParentExistInDb = true
//         //             //                         console.log("inside--",isMemberParentExistInDb)
//         //             //                         let insertParentMemberObj = {
//         //             //                             FirstName:parentData.name,
//         //             //                             MiddleName:parentData.middleName,
//         //             //                             DOB:parentData.dob,
//         //             //                             Gender:parentData.gender,
//         //             //                             VoterVotingId:parentData.voterVotingId,
//         //             //                             BoothId:addressObj.BoothId,
//         //             //                             FamilyId:tempFamilyId
//         //             //                         }
//         //             //                         await voterMaster.create(insertParentMemberObj).then(async (isParentInserted)=>{
//         //             //                             if(isParentInserted) {
//         //             //                                 tempParentId = isParentInserted.dataValues.VoterId
//         //             //                                 insertMemberObj = {
//         //             //                                     FirstName:memberData.name,
//         //             //                                     MiddleName:memberData.middleName,
//         //             //                                     DOB:memberData.dob,
//         //             //                                     Gender:memberData.gender,
//         //             //                                     VoterVotingId:memberData.voterVotingId,
//         //             //                                     BoothId:addressObj.BoothId,
//         //             //                                     FamilyId:tempFamilyId
//         //             //                                 }
//         //             //                                 if(parseInt(tempParentId) > 0){
//         //             //                                     if(memberData.relation === 'father'){
//         //             //                                         insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//         //             //                                     } else  {
//         //             //                                         insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//         //             //                                     }
//         //             //                                 }
//         //             //                                 await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //             //                                     if(isNewMemberCreated) {
//         //             //                                         console.log("New member added...")
//         //             //                                     }
//         //             //                                 }).catch((err)=>{
//         //             //                                     // console.log("new member error",err)
//         //             //                                 })
//         //             //                                 tempParentId = 0;
//         //             //                             }
//         //             //                         }).catch((err)=>{
//         //             //                             // console.log("parent error",err)
//         //             //                         })
//         //             //                         return;
//         //             //                     }
//         //             //                 }
//         //             //             })
//         //             //             if(!isMemberParentExistInDb){
//         //             //                 insertMemberObj = {
//         //             //                     FirstName:memberData.name,
//         //             //                     MiddleName:memberData.middleName,
//         //             //                     DOB:memberData.dob,
//         //             //                     Gender:memberData.gender,
//         //             //                     VoterVotingId:memberData.voterVotingId,
//         //             //                     BoothId:addressObj.BoothId,
//         //             //                     FamilyId:FamilyId
//         //             //                 }
//         //             //                 await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//         //             //                     if(isNewMemberCreated) {
//         //             //                         console.log("New member added...")
//         //             //                     }
//         //             //                 }).catch((err)=>{
//         //             //                     // console.log("new member error",err)
//         //             //                 })
//         //             //                 isMemberParentExistInDb = false
//         //             //             }
//         //             //
//         //             //         }
//         //             //     }).catch((err)=>{
//         //             //         // console.log("err-",err)
//         //             //     })
//         //             // })
//         //         }
//         //     })
//         // })
//         let FamilyId = 1
//
//         addressWiseDataArray.map(async (address)=>{
//             await checkAddressExist(address.address).then(async (isAddressExist)=>{
//                 if(isAddressExist){
//                     let FamilyId = isAddressExist;
//                     let condition = null;
//                     await address.addressData.map(async (memberData)=>{
//                         let isMemberParentExistInDb = false
//                         condition = {
//                             FirstName: { [Op.like]: `%${memberData.middleName.trim()}%` },
//                         };
//                         let tempFamilyId = FamilyId
//                         let tempParentId = 0;
//                         let needToUpdate = false;
//                         voterMaster.findOne({where:{VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.toString().trim()}` }}}).then(async (isMemberExist)=>{
//                             if(isMemberExist){
//                                 await voterMaster.findAll({attributes:['FamilyId','VoterId'],where:{
//                                         FirstName: { [Op.like]: `%${memberData.middleName.trim()}%` },
//                                     }}).then(async (isParentExist)=>{
//                                     if(isParentExist.length > 0){
//                                         // console.log("parent exist",memberData.name,isParentExist)
//                                         if(isParentExist.length === 1){
//                                             tempFamilyId = isParentExist[0].dataValues.FamilyId
//                                             tempParentId = isParentExist[0].dataValues.VoterId
//                                         } else if(isParentExist.length>1) {
//                                             await isParentExist.map((parentData)=>{
//                                                 condition = {
//                                                     FamilyId: { [Op.eq]: parentData.FamilyId },
//                                                 };
//                                                 familyMaster.findOne({where:condition,
//                                                     include: [
//                                                         {
//                                                             model: addressMaster,
//                                                         }]
//                                                 }).then((parentAddressData)=>{
//                                                     if(parentAddressData.Address.length >= memberData.address){
//                                                         if(parentAddressData.Address.includes(memberData.address)){
//                                                             tempFamilyId = parentData.FamilyId;
//                                                             tempParentId = parentData.VoterId
//                                                             return;
//                                                         }
//                                                     } else {
//                                                         if(memberData.address.includes(parentAddressData.Address)){
//                                                             tempFamilyId = parentData.FamilyId;
//                                                             tempParentId = parentData.VoterId
//                                                             return;
//                                                         }
//                                                     }
//                                                 })
//                                             })
//                                         }
//                                         insertMemberObj = {
//                                             FirstName:memberData.name,
//                                             MiddleName:memberData.middleName,
//                                             Age:memberData.age,
//                                             Gender:memberData.gender,
//                                             VoterVotingId:memberData.voterVotingId,
//                                             BoothId:addressObj.BoothId,
//                                             FamilyId:tempFamilyId
//                                         }
//                                         if(parseInt(tempParentId) > 0){
//                                             if(memberData.relation === 'father'){
//                                                 insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//                                             } else  {
//                                                 insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//                                             }
//                                         }
//                                         voterMaster.update(insertMemberObj,{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.toString().trim()}` }}}).then((updateRes)=>{
//                                             if(updateRes){
//                                                 console.log("updated...")
//                                             }
//                                         }).catch((err)=>{
//                                             console.log("erro")
//                                         })
//                                         // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                         //     if(isNewMemberCreated) {
//                                         //         console.log("New member added from here...")
//                                         //     }
//                                         // }).catch((err)=>{
//                                         //     // console.log("new member error from here..",err)
//                                         // })
//                                         // if(needToUpdate){
//                                         //     voterMaster.update({insertMemberObj},{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.trim()}` }}}).then((updateRes)=>{
//                                         //         if(updateRes){
//                                         //             console.log("updated...")
//                                         //         }
//                                         //     }).catch((err)=>{
//                                         //         console.log("erro")
//                                         //     })
//                                         // } else {
//                                         //     await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                         //         if(isNewMemberCreated) {
//                                         //             console.log("New member added from here...")
//                                         //         }
//                                         //     }).catch((err)=>{
//                                         //         // console.log("new member error from here..",err)
//                                         //     })
//                                         // }
//
//
//                                         tempParentId = 0;
//                                     } else {
//                                         await allDataMembers.map(async (parentData,index)=>{
//                                             if(parentData.voterVotingId !== memberData.voterVotingId){
//                                                 if(parentData.name.includes(memberData.middleName)){
//                                                     isMemberParentExistInDb = true
//                                                     let insertParentMemberObj = {
//                                                         FirstName:parentData.name,
//                                                         MiddleName:parentData.middleName,
//                                                         Age:parentData.age,
//                                                         Gender:parentData.gender,
//                                                         VoterVotingId:parentData.voterVotingId,
//                                                         BoothId:addressObj.BoothId,
//                                                         FamilyId:tempFamilyId
//                                                     }
//                                                     await voterMaster.create(insertParentMemberObj).then(async (isParentInserted)=> {
//                                                         if (isParentInserted) {
//                                                             tempParentId = isParentInserted.dataValues.VoterId
//                                                             insertMemberObj = {
//                                                                 FirstName: memberData.name,
//                                                                 MiddleName: memberData.middleName,
//                                                                 Age: memberData.age,
//                                                                 Gender: memberData.gender,
//                                                                 VoterVotingId: memberData.voterVotingId,
//                                                                 BoothId: addressObj.BoothId,
//                                                                 FamilyId: tempFamilyId
//                                                             }
//                                                             if (parseInt(tempParentId) > 0) {
//                                                                 if (memberData.relation === 'father') {
//                                                                     insertMemberObj = {
//                                                                         ...insertMemberObj,
//                                                                         FatherId: tempParentId
//                                                                     }
//                                                                 } else {
//                                                                     insertMemberObj = {
//                                                                         ...insertMemberObj,
//                                                                         SpouseId: tempParentId
//                                                                     }
//                                                                 }
//                                                                 voterMaster.update(insertMemberObj,{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.toString().trim()}` }}}).then((updateRes)=>{
//                                                                     if(updateRes){
//                                                                         console.log("updated from heree...")
//                                                                     }
//                                                                 }).catch((err)=>{
//                                                                     console.log("erro")
//                                                                 })
//                                                             }
//                                                         }
//                                                     })
//                                                     //
//                                                     //         // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                                     //         //     if(isNewMemberCreated) {
//                                                     //         //         console.log("New member added from here...")
//                                                     //         //     }
//                                                     //         // }).catch((err)=>{
//                                                     //         //     // console.log("new member error from here..",err)
//                                                     //         // })
//                                                     //
//                                                     //
//                                                     //             voterMaster.update({insertMemberObj},{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.trim()}` }}}).then((updateRes)=>{
//                                                     //                 if(updateRes){
//                                                     //                     console.log("updated...")
//                                                     //                 }
//                                                     //             }).catch((err)=>{
//                                                     //                 console.log("error")
//                                                     //             })
//                                                     //
//                                                     //
//                                                     //         // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                                     //         //     if(isNewMemberCreated) {
//                                                     //         //         console.log("New member added...")
//                                                     //         //     }
//                                                     //         // }).catch((err)=>{
//                                                     //         //     // console.log("new member error",err)
//                                                     //         // })
//                                                     //         tempParentId = 0;
//                                                     //     }
//                                                     // }).catch((err)=>{
//                                                     //     console.log("parent error",err)
//                                                     // })
//                                                     return;
//                                                 }
//                                             }
//                                         })
//                                         if(!isMemberParentExistInDb){
//                                             insertMemberObj = {
//                                                 FirstName:memberData.name,
//                                                 MiddleName:memberData.middleName,
//                                                 Age:memberData.age,
//                                                 Gender:memberData.gender,
//                                                 VoterVotingId:memberData.voterVotingId,
//                                                 BoothId:addressObj.BoothId,
//                                                 FamilyId:FamilyId
//                                             }
//                                             await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                                 if(isNewMemberCreated) {
//                                                     console.log("New member added...")
//                                                 }
//                                             }).catch((err)=>{
//                                                 // console.log("new member error",err)
//                                             })
//                                             isMemberParentExistInDb = false
//                                         }
//
//                                     }
//                                 }).catch((err)=>{
//                                     // console.log("err-",err)
//                                 })
//
//                             } else {
//                                 console.log("called--")
//                                 await voterMaster.findAll({attributes:['FamilyId','VoterId'],where:{
//                                         FirstName: { [Op.like]: `%${memberData.middleName.trim()}%` },
//                                     }}).then(async (isParentExist)=>{
//                                     if(isParentExist.length > 0){
//                                         // console.log("parent exist",memberData.name,isParentExist)
//                                         if(isParentExist.length === 1){
//                                             tempFamilyId = isParentExist[0].dataValues.FamilyId
//                                             tempParentId = isParentExist[0].dataValues.VoterId
//                                         } else if(isParentExist.length>1) {
//                                             await isParentExist.map((parentData)=>{
//                                                 condition = {
//                                                     FamilyId: { [Op.eq]: parentData.FamilyId },
//                                                 };
//                                                 familyMaster.findOne({where:condition,
//                                                     include: [
//                                                         {
//                                                             model: addressMaster,
//                                                         }]
//                                                 }).then((parentAddressData)=>{
//                                                     if(parentAddressData.Address.length >= memberData.address){
//                                                         if(parentAddressData.Address.includes(memberData.address)){
//                                                             tempFamilyId = parentData.FamilyId;
//                                                             tempParentId = parentData.VoterId
//                                                             return;
//                                                         }
//                                                     } else {
//                                                         if(memberData.address.includes(parentAddressData.Address)){
//                                                             tempFamilyId = parentData.FamilyId;
//                                                             tempParentId = parentData.VoterId
//                                                             return;
//                                                         }
//                                                     }
//                                                 })
//                                             })
//                                         }
//                                         insertMemberObj = {
//                                             FirstName:memberData.name,
//                                             MiddleName:memberData.middleName,
//                                             Age:memberData.age,
//                                             Gender:memberData.gender,
//                                             VoterVotingId:memberData.voterVotingId,
//                                             BoothId:addressObj.BoothId,
//                                             FamilyId:tempFamilyId
//                                         }
//                                         if(parseInt(tempParentId) > 0){
//                                             if(memberData.relation === 'father'){
//                                                 insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//                                             } else  {
//                                                 insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//                                             }
//                                         }
//                                         voterMaster.create(insertMemberObj).then((updateRes)=>{
//                                             if(updateRes){
//                                                 console.log("inserted...")
//                                             }
//                                         }).catch((err)=>{
//                                             console.log("erro")
//                                         })
//                                         tempParentId = 0;
//                                     } else {
//                                         await allDataMembers.map(async (parentData,index)=>{
//                                             if(parentData.voterVotingId !== memberData.voterVotingId){
//                                                 if(parentData.name.includes(memberData.middleName)){
//                                                     isMemberParentExistInDb = true
//                                                     let insertParentMemberObj = {
//                                                         FirstName:parentData.name,
//                                                         MiddleName:parentData.middleName,
//                                                         Age:parentData.age,
//                                                         Gender:parentData.gender,
//                                                         VoterVotingId:parentData.voterVotingId,
//                                                         BoothId:addressObj.BoothId,
//                                                         FamilyId:tempFamilyId
//                                                     }
//                                                     await voterMaster.create(insertParentMemberObj).then(async (isParentInserted)=> {
//                                                         if (isParentInserted) {
//                                                             tempParentId = isParentInserted.dataValues.VoterId
//                                                             insertMemberObj = {
//                                                                 FirstName: memberData.name,
//                                                                 MiddleName: memberData.middleName,
//                                                                 Age: memberData.age,
//                                                                 Gender: memberData.gender,
//                                                                 VoterVotingId: memberData.voterVotingId,
//                                                                 BoothId: addressObj.BoothId,
//                                                                 FamilyId: tempFamilyId
//                                                             }
//                                                             if (parseInt(tempParentId) > 0) {
//                                                                 if (memberData.relation === 'father') {
//                                                                     insertMemberObj = {
//                                                                         ...insertMemberObj,
//                                                                         FatherId: tempParentId
//                                                                     }
//                                                                 } else {
//                                                                     insertMemberObj = {
//                                                                         ...insertMemberObj,
//                                                                         SpouseId: tempParentId
//                                                                     }
//                                                                 }
//                                                                 voterMaster.create(insertMemberObj).then((updateRes)=>{
//                                                                     if(updateRes){
//                                                                         console.log("inserted from heree...")
//                                                                     }
//                                                                 }).catch((err)=>{
//                                                                     console.log("erro")
//                                                                 })
//                                                             }
//                                                         }
//                                                     })
//                                                     return;
//                                                 }
//                                             }
//                                         })
//                                         if(!isMemberParentExistInDb){
//                                             console.log("--called")
//                                             insertMemberObj = {
//                                                 FirstName:memberData.name,
//                                                 MiddleName:memberData.middleName,
//                                                 Age:memberData.age,
//                                                 Gender:memberData.gender,
//                                                 VoterVotingId:memberData.voterVotingId,
//                                                 BoothId:addressObj.BoothId,
//                                                 FamilyId:FamilyId
//                                             }
//                                             await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                                                 if(isNewMemberCreated) {
//                                                     console.log("New member added...")
//                                                 }
//                                             }).catch((err)=>{
//                                                 // console.log("new member error",err)
//                                             })
//                                             isMemberParentExistInDb = false
//                                         }
//
//                                     }
//                                 }).catch((err)=>{
//                                     // console.log("err-",err)
//                                 })
//                             }
//                         })
//                         // await voterMaster.findOne({VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.trim()}` }}).then(async (isMemberAlreadyExist)=>{
//                         //     await voterMaster.findAll({attributes:['FamilyId','VoterId'],where:condition}).then(async (isParentExist)=>{
//                         //         if(isParentExist.length > 0){
//                         //             if(isParentExist.length === 1){
//                         //                 tempFamilyId = isParentExist[0].dataValues.FamilyId
//                         //                 tempParentId = isParentExist[0].dataValues.VoterId
//                         //             } else if(isParentExist.length>1) {
//                         //                 await isParentExist.map((parentData)=>{
//                         //                     condition = {
//                         //                         FamilyId: { [Op.eq]: parentData.FamilyId },
//                         //                     };
//                         //                     familyMaster.findOne({where:condition,
//                         //                         include: [
//                         //                             {
//                         //                                 model: addressMaster,
//                         //                             }]
//                         //                     }).then((parentAddressData)=>{
//                         //                         if(parentAddressData.Address.length >= memberData.address){
//                         //                             if(parentAddressData.Address.includes(memberData.address)){
//                         //                                 tempFamilyId = parentData.FamilyId;
//                         //                                 tempParentId = parentData.VoterId
//                         //                                 return;
//                         //                             }
//                         //                         } else {
//                         //                             if(memberData.address.includes(parentAddressData.Address)){
//                         //                                 tempFamilyId = parentData.FamilyId;
//                         //                                 tempParentId = parentData.VoterId
//                         //                                 return;
//                         //                             }
//                         //                         }
//                         //                     })
//                         //                 })
//                         //             }
//                         //             insertMemberObj = {
//                         //                 FirstName:memberData.name,
//                         //                 MiddleName:memberData.middleName,
//                         //                 DOB:memberData.dob,
//                         //                 Gender:memberData.gender,
//                         //                 VoterVotingId:memberData.voterVotingId,
//                         //                 BoothId:addressObj.BoothId,
//                         //                 FamilyId:tempFamilyId
//                         //             }
//                         //             if(parseInt(tempParentId) > 0){
//                         //                 if(memberData.relation === 'father'){
//                         //                     insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//                         //                 } else  {
//                         //                     insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//                         //                 }
//                         //             }
//                         //             // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                         //             //     if(isNewMemberCreated) {
//                         //             //         console.log("New member added from here...")
//                         //             //     }
//                         //             // }).catch((err)=>{
//                         //             //     // console.log("new member error from here..",err)
//                         //             // })
//                         //             if(needToUpdate){
//                         //                 voterMaster.update({insertMemberObj},{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.trim()}` }}}).then((updateRes)=>{
//                         //                     if(updateRes){
//                         //                         console.log("updated...")
//                         //                     }
//                         //                 }).catch((err)=>{
//                         //                     console.log("erro")
//                         //                 })
//                         //             } else {
//                         //                 await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                         //                     if(isNewMemberCreated) {
//                         //                         console.log("New member added from here...")
//                         //                     }
//                         //                 }).catch((err)=>{
//                         //                     // console.log("new member error from here..",err)
//                         //                 })
//                         //             }
//                         //
//                         //
//                         //             tempParentId = 0;
//                         //         } else {
//                         //             await allDataMembers.map(async (parentData,index)=>{
//                         //                 if(parentData.voterVotingId !== memberData.voterVotingId){
//                         //                     if(parentData.name.includes(memberData.middleName)){
//                         //                         isMemberParentExistInDb = true
//                         //                         console.log("inside--",isMemberParentExistInDb)
//                         //                         let insertParentMemberObj = {
//                         //                             FirstName:parentData.name,
//                         //                             MiddleName:parentData.middleName,
//                         //                             DOB:parentData.dob,
//                         //                             Gender:parentData.gender,
//                         //                             VoterVotingId:parentData.voterVotingId,
//                         //                             BoothId:addressObj.BoothId,
//                         //                             FamilyId:tempFamilyId
//                         //                         }
//                         //                         await voterMaster.create(insertParentMemberObj).then(async (isParentInserted)=>{
//                         //                             if(isParentInserted) {
//                         //                                 tempParentId = isParentInserted.dataValues.VoterId
//                         //                                 insertMemberObj = {
//                         //                                     FirstName:memberData.name,
//                         //                                     MiddleName:memberData.middleName,
//                         //                                     DOB:memberData.dob,
//                         //                                     Gender:memberData.gender,
//                         //                                     VoterVotingId:memberData.voterVotingId,
//                         //                                     BoothId:addressObj.BoothId,
//                         //                                     FamilyId:tempFamilyId
//                         //                                 }
//                         //                                 if(parseInt(tempParentId) > 0){
//                         //                                     if(memberData.relation === 'father'){
//                         //                                         insertMemberObj = {...insertMemberObj,FatherId:tempParentId}
//                         //                                     } else  {
//                         //                                         insertMemberObj = {...insertMemberObj,SpouseId:tempParentId}
//                         //                                     }
//                         //                                 }
//                         //
//                         //                                 // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                         //                                 //     if(isNewMemberCreated) {
//                         //                                 //         console.log("New member added from here...")
//                         //                                 //     }
//                         //                                 // }).catch((err)=>{
//                         //                                 //     // console.log("new member error from here..",err)
//                         //                                 // })
//                         //
//                         //                                 if(needToUpdate){
//                         //                                     voterMaster.update({insertMemberObj},{where: {VoterVotingId: { [Op.eq]: `${memberData.voterVotingId.trim()}` }}}).then((updateRes)=>{
//                         //                                         if(updateRes){
//                         //                                             console.log("updated...")
//                         //                                         }
//                         //                                     }).catch((err)=>{
//                         //                                         console.log("error")
//                         //                                     })
//                         //                                 } else {
//                         //
//                         //                                 }
//                         //
//                         //                                 // await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                         //                                 //     if(isNewMemberCreated) {
//                         //                                 //         console.log("New member added...")
//                         //                                 //     }
//                         //                                 // }).catch((err)=>{
//                         //                                 //     // console.log("new member error",err)
//                         //                                 // })
//                         //                                 tempParentId = 0;
//                         //                             }
//                         //                         }).catch((err)=>{
//                         //                             console.log("parent error",err)
//                         //                         })
//                         //                         return;
//                         //                     }
//                         //                 }
//                         //             })
//                         //             if(!isMemberParentExistInDb){
//                         //                 insertMemberObj = {
//                         //                     FirstName:memberData.name,
//                         //                     MiddleName:memberData.middleName,
//                         //                     DOB:memberData.dob,
//                         //                     Gender:memberData.gender,
//                         //                     VoterVotingId:memberData.voterVotingId,
//                         //                     BoothId:addressObj.BoothId,
//                         //                     FamilyId:FamilyId
//                         //                 }
//                         //                 await voterMaster.create(insertMemberObj).then((isNewMemberCreated)=>{
//                         //                     if(isNewMemberCreated) {
//                         //                         console.log("New member added...")
//                         //                     }
//                         //                 }).catch((err)=>{
//                         //                     // console.log("new member error",err)
//                         //                 })
//                         //                 isMemberParentExistInDb = false
//                         //             }
//                         //
//                         //         }
//                         //     }).catch((err)=>{
//                         //         // console.log("err-",err)
//                         //     })
//                         // }).catch((err)=>{
//                         //
//                         // })
//
//                     })
//
//                 } else {
//                     console.log("not exist")
//                 }
//             })
//             resolve(true)
//         })
//     })
// }

const uploadImageOnFirebase = async (imgPath, destinationPath) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const bucket = storage.bucket("gs://textrecognize-e0630.appspot.com/");
        const metadata = {
            metadata: {
                firebaseStorageDownloadTokens: uuid(),
            },
        };
        await bucket
            .upload(imgPath, {
                destination: destinationPath,
                gzip: true,
                metadata,
            })
            .then(async (res) => {
                const file = bucket.file(res[0].metadata.name);
                await file
                    .getSignedUrl({
                        action: "read",
                        expires: "03-09-2491",
                    })
                    .then((url) => {
                        return resolve(url);
                    });
            })
            .catch((err) => {
                console.log("err--",err)
                return resolve(false);
            });
    });
};
const getTemplateCategory = () =>{
    return new Promise((resolve)=>{
        digitalMasterCategory.findAll().then((category)=>{
            if(category){
                resolve(category)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(false)
        })

    })
}
const addNewTemplate = (data) =>{
    return new Promise((resolve)=>{
        templateMaster.create(data).then((isCreated)=>{
            if(isCreated){
                resolve(true)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(false)
        })

    })
}
const covertPdfToImage =(pdfUrl)=>{
    const imgName = "IMG_"+new Date().getTime();
    const destinationPath = `TemplateImages/img${imgName}.jpg`;
    console.log("pdf url--",pdfUrl)
    return new Promise(async (resolve)=>{
        const options = {
            density: 100,
            saveFilename: imgName,
            savePath: "Images/",
            format: "jpg",
            width: 1000,
            height: 1000
        };
        const fileName = "PDF/"+"PDF_"+new Date().getTime()+".pdf"
        const file = fs.createWriteStream(fileName);
        try{
            const request = await http.get(pdfUrl, async function(response) {
                response.pipe(file).on("close",async ()=>{
                    const storeAsImage = fromPath(fileName, options);
                    const pageToConvertAsImage = 1;
                    await storeAsImage(pageToConvertAsImage).then((res) => {
                        if(res){
                            uploadImageOnFirebase("Images/"+imgName+".1.jpg").then((url)=>{
                                if(url){
                                    console.log("url--",url)
                                    resolve(url[0])
                                } else {
                                    console.log("called")
                                    resolve(false)
                                }
                            })
                        } else {
                            console.log("called this")
                            resolve(false)
                        }
                    }).catch((err)=>{
                        console.log("err-",err)
                        resolve(false)
                    });
                });
            });
        }
        catch (e) {
            resolve(false)
        }
    })};

const getVoterWhoDoesNotVote = (ElectionId,BoothId) =>{
    return new Promise((resolve)=>{
        let condition = {
            ElectionId: { [Op.eq]: ElectionId },
        };


        election_voter.findOne({where:condition}).then((isAnyVoterAvailable)=>{
            if(isAnyVoterAvailable){
                sequelize.query("SELECT * FROM "+DATABASE_NAME+".VoterMaster where BoothId = "+BoothId+" and VoterId not in(select VoterId from "+DATABASE_NAME+".Election_Voter where ElectionId="+ElectionId+")").then((votersList)=>{
                    if(votersList){
                        resolve(votersList[0])
                    } else{
                        resolve(false)
                    }
                }).catch((err)=>{
                    if(err){
                        resolve(false)
                    }
                })
            } else {
                let conditionForVoterMaster = {
                    BoothId: { [Op.eq]: BoothId },
                };
                voterMaster.findAll({where:conditionForVoterMaster}).then((allVoters)=>{
                    if(allVoters){
                        resolve(allVoters)
                    } else {
                        resolve(false)
                    }
                }).catch((err)=>{
                    resolve(false)
                })
            }
        }).catch((err)=>{
            resolve(false)
        })

    })
}
const getVoterWhoDoesVote = (ElectionId,BoothId) =>{
    return new Promise((resolve)=>{
        let condition = {
            ElectionId: { [Op.eq]: ElectionId },
        };
        election_voter.findOne({where:condition}).then((isAnyVoterAvailable)=>{
            if(isAnyVoterAvailable){
                sequelize.query("SELECT * FROM "+DATABASE_NAME+".VoterMaster where BoothId = "+BoothId+" and VoterId in(select VoterId from "+DATABASE_NAME+".Election_Voter where ElectionId="+ElectionId+")").then((votersList)=>{
                    if(votersList){
                        resolve(votersList[0])
                    } else{
                        resolve(false)
                    }
                }).catch((err)=>{
                    if(err){
                        resolve(false)
                    }
                })
            } else {
                resolve([])
            }
        }).catch((err)=>{
            resolve(false)
        })

    })
}

const getAllElectionList = ()=>{
    return new Promise((resolve)=>{
        electionMaster.findAll().then((electionList)=>{
            if(electionList){
                resolve(electionList)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const getVolunteerElection = (volunteerId,electionId) =>{
    return new Promise((resolve)=>{
        sequelize.query("SELECT * FROM "+DATABASE_NAME+".WardMaster where WardId in (select BoothId from "+DATABASE_NAME+".Volunteer_Election where ElectionId = "+electionId+" and VolunteerId ="+volunteerId+")")
            .then((volunterElectionList)=>{
            if(volunterElectionList){
                resolve(volunterElectionList[0])
            } else {
                resolve(false)
            }
        }).catch((err)=>{
                resolve(false)
        })
    })
}
const getElectionBoothForAdmin = (electionId) =>{
    return new Promise((resolve)=>{
        sequelize.query("SELECT * FROM "+DATABASE_NAME+".WardMaster")
            .then((volunterElectionList)=>{
                if(volunterElectionList){
                    resolve(volunterElectionList[0])
                } else {
                    resolve(false)
                }
            }).catch((err)=>{
            resolve(false)
        })
    })
}


const getElectionWithoutVolunteer = (volunteerId,electionId) =>{
    return new Promise((resolve)=>{
      sequelize.query("SELECT * FROM "+DATABASE_NAME+".WardMaster where WardId not in (select BoothId from "+DATABASE_NAME+".Volunteer_Election where ElectionId = "+electionId+" and VolunteerId ="+volunteerId+")")
          .then((volunterElectionList)=>{
            if(volunterElectionList){
                resolve(volunterElectionList[0])
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false);

        })
    })
}

const updateVolunteerElectionStatus = (data) =>{
    return new Promise((resolve)=>{
        const condition = { VolunteerId: { [Op.eq]: data.volunteerId},ElectionId: { [Op.eq]: data.electionId},BoothId: { [Op.eq]: data.boothId}};
        volunteer_election.findOne({where:condition}).then((isAvilable)=>{
            if(isAvilable){
                volunteer_election.destroy({where:condition}).then((isRemoved)=>{
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
                    ElectionId:data.electionId,
                    BoothId:data.boothId
                }
                volunteer_election.create(insObj).then((isNewCreated)=>{
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

const updateVoterElectionStatus = (data) =>{
    return new Promise((resolve)=>{
        const condition = { VoterId: { [Op.eq]: data.voterId},ElectionId: { [Op.eq]: data.electionId}};
        election_voter.findOne({where:condition}).then((isAvilable)=>{
            console.log(isAvilable)
            if(isAvilable){
                election_voter.destroy({where:condition}).then((isRemoved)=>{
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
                    VoterId: data.voterId,
                    ElectionId:data.electionId
                }
                election_voter.create(insObj).then((isNewCreated)=>{
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

const getAllBooths = () =>{
    return new Promise((resolve)=>{
        wardMaster.findAll().then((res)=>{
            if(res){
                resolve(res)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const insertNewBooth = (boothData) =>{
    return new Promise((resolve)=>{
        wardMaster.create(boothData).then((isCreated)=>{
            if(isCreated){
                resolve(isCreated.dataValues.WardId)
            } else {
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}


module.exports = {
    insertNewBooth,
    getAllBooths,
    updateVoterElectionStatus,
    updateVolunteerElectionStatus,
    getElectionWithoutVolunteer,
    getVolunteerElection,
    getAllElectionList,
    getVoterWhoDoesVote,
    getVoterWhoDoesNotVote,
    addNewTemplate,
    getTemplateCategory,
    covertPdfToImage,
    insertBulkDataInDb,
    getFamilyTreeData,
    getMemberData,
    addDeviceId,
    addTokenToTable,
    getMemberDetail,
    searchData,
    getMemberById,
    removeToken,
    getMemberIdFromToken,
    updateUserProfile,
    getSpecificMemberDetailForUpdate,
    setTokenAfterPasswordChange,
    filterData,
    changeUserPassword,
    sortData,
    getCityNameFromState,
    getStateNameFromCountry,
    getCountryCode,
    getEventInformation,
    getSpecificMemberDetail
};
