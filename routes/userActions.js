const {addNewTemplate,getTemplateCategory,insertBulkDataInDb,searchData,filterData,getEventInformation,getSpecificMemberDetail,updateUserProfile,getFamilyTreeData} = require("../handler/voterData");
const {sort_by_key,fetchAllBoothName,fetchAllTrustFactor,fetchAllOccupation,getAllNativePlace,fetchAllCastName,fetchAllNativePlace,fetchAllRegion,getAllFamilyWiseDetails,getAllCast,isDefined,getCastIdFromCastName,getNativePlaceIdFromCastName} = require("../handler/common/commonMethods")
const {decodeDataFromAccessToken} = require("../handler/utils")
const loadash = require("lodash")
const express = require("express");
const {
    getMemberData,

} = require("../handler/voterData");
const {
    PAGE_LIMIT,
    DATA_NOT_FOUND_MESSAGE,
    gender,
    marital_status
} = require("../handler/common/constants");


const router = express.Router();
const db = require("../models");
const { Op } = db.Sequelize;
const {addressMaster,familyMaster,voterMaster} = db
router.post("/filterData", async (request, response) => {
    const req = request.body;
    if (isDefined(req.sortingCreteria)) {
        filterData(req.filterFields, req.sortingCreteria).then((result) => {
            return response.send(result);
        });
    } else {
        filterData(req.filterFields).then((result) => {
            return response.send(result);
        });
    }
});
router.get("/getRegionArray/", async (request, response) => {
    // const daughterStatus = ["SAMAJ DAUGHTER", "OUTSIDE SAMAJ DAUGHTER"];
    // const headStatus = ["FAMILY HEAD", "NORMAL MEMBER"];
    // const gender = ["MALE", "FEMALE"];
    let obj = { marital_status,gender };
    obj = {...obj,MaritalStatuses:marital_status}

    await fetchAllBoothName().then((res) => {
        if (res) {
            obj = { ...obj,BoothName: res.BoothName.sort() };
        }
    });
    await fetchAllNativePlace().then((res) => {
        if (res) {
            obj = { ...obj,NativePlace: res.NativePlace.sort() };
        }
    });
    await fetchAllCastName().then((res) => {
        if (res) {
            obj = { ...obj,CastName: res.CastName.sort() };
        }
    });
    await fetchAllTrustFactor().then((res) => {
        if (res) {
            obj = { ...obj,TrustFactor: res.TrustFactor.sort() };
        }
    });
    await fetchAllRegion().then((res) => {
        if (res) {
            obj = {
                ...obj,
                State: res.States.sort(),
                City: res.City.sort(),
                Country: res.Countries.sort(),
                District: res.District.sort(),
            };
        }
    });
    // await fetchAllMaritalStatus().then((res) => {
    //     if (res) {
    //         obj = {
    //             ...obj,
    //             MaritalStatuses: res.MaritalStatus.sort(),
    //         };
    //     }
    // });
    // await countTotalRecord().then((res) => {
    //     if (res) {
    //         obj = {
    //             ...obj,
    //             TotalRecords: res,
    //         };
    //     }
    // });

    if (obj !== {}) {
        response.status(200).send({ data: obj });
    } else {
        response.status(202).send({ data: "data not found" });
    }
});

router.get("/getEventInformation/", async (request, response) => {
   getEventInformation().then((res)=>{
       if(res){
           response.status(200).send({ data: res });
       } else {
           response.status(201).send({ data: "event not found" });
       }
   })
});

router.get("/getSpecificMemberDetail/", async (request, response) => {
    let tokenData = null;
    await decodeDataFromAccessToken(request.headers.token).then((res) => {
        if (res) {
            tokenData = res;
        }
    });
    if(tokenData !== null){
        getSpecificMemberDetail(tokenData.voterId).then(async (memberData)=>{
            console.log("--data,",memberData)
            if(memberData){
                let memberDetailArray = [];
                memberDetailArray.push(memberData)
                let obj = {};
                obj = {...obj,MaritalStatuses:marital_status}
                await fetchAllNativePlace().then((res) => {
                    if (res) {
                        obj = { ...obj,NativePlace: res.NativePlace.sort() };
                    }
                });
                await fetchAllCastName().then((res) => {
                    if (res) {
                        obj = { ...obj,CastName: res.CastName.sort() };
                    }
                });
                await fetchAllTrustFactor().then((res) => {
                    if (res) {
                        obj = { ...obj,TrustFactor: res.TrustFactor.sort() };
                    }
                });
                await fetchAllOccupation().then((res) => {
                    if (res) {
                        obj = { ...obj,Occupations: res.Occupations.sort() };
                    }
                });

                await fetchAllRegion().then((res) => {
                    if (res) {
                        obj = {
                            ...obj,
                            State: res.States.sort(),
                            City: res.City.sort(),
                            Country: res.Countries.sort(),
                            District: res.District.sort(),
                        };
                    }
                });

                const finalArray = {
                    UserData: memberData,
                    SearchData: obj,
                };
                return response.status(200).send({"data":finalArray})
            } else {
                return response.status(201).send({"data":"data not found"})
            }
        }).catch((err)=>{
            return response.status(201).send({"data":"data not found"})
        })
    } else {
        return response.status(201).send({"data":"data not found"})
    }
});

router.get(
    "/getAllMemberInfo/",
    (req, res, next) => {
        // eslint-disable-next-line no-restricted-globals
        if (typeof req.query.page !== "undefined" && isNaN(req.query.page)) {
            res.status(202).send({ data: "data not found", next_endpoint: "null" });
        }
        next();
    },
    (req, res) => {
        let offset = 0;
        let page = 0;
        if (typeof req.query.page !== "undefined") {
            if (parseInt(req.query.page) === 0) {
                offset = 0;
                page = 0;
            } else if (parseInt(req.query.page) > 0) {
                // eslint-disable-next-line radix
                offset = (parseInt(req.query.page) - 1) * PAGE_LIMIT;
                // eslint-disable-next-line no-unused-vars
                page = req.query.page;
            } else if (parseInt(req.query.page) === -1) {
                offset = -1;
                page = 0;
            }
        }
        getMemberData(offset, page)
            .then((members) => {
                if (members.Data.length >= 0) {
                    return res
                        .status(200)
                        .send({ data: members.Data, next_endpoint: members.next_endpoint });
                }
                return res
                    .status(203)
                    .send({ data: "data not found", next_endpoint: "null" });
            })
            .catch((err) => {
                console.log(err)
                res.status(202).send({ data: "data not found" });
            });
    }
);

router.get(
    "/getAutoCompleteBoxData",
    async (req, res) => {
        let responseObj = {};
        await getAllNativePlace().then((res)=>{
            if(res){
                // responseArray.push({"nativePlace":res})
                responseObj={...responseObj,nativePlace:res}
            }
        })
        await getAllCast().then((res)=>{
            if(res){
                 responseObj={...responseObj,cast:res}
            }
        })
            return res.status(200).send({"data":responseObj})

    }
);

router.post(
    "/addNewFamily",(req,res,next)=>{
        let data = req.body
        if (!isDefined(data.address)) {
            return res.status(201).send({ data: "please enter a address"});
        }
        else if (!isDefined(data.city)) {
            return res.status(201).send({ data: "please enter a address"});
        }
        else if (!isDefined(data.district)) {
            return res.status(201).send({ data: "please enter a district"});
        }
        else if (!isDefined(data.state)) {
            return res.status(201).send({ data: "please enter a state"});
        }
        else if (!isDefined(data.country)) {
            return res.status(201).send({ data: "please enter a country"});
        }
        else if (!isDefined(data.pincode)) {
            return res.status(201).send({ data: "please enter a pincode"});
        }
        else if (!isDefined(data.phone)) {
            return res.status(201).send({ data: "please enter a home phone number"});
        }
        else if (!isDefined(data.nativePlace)) {
            return res.status(201).send({ data: "please enter a native place"});
        }
        else if (!isDefined(data.cast)) {
            return res.status(201).send({ data: "please enter a cast"});
        }
        next()
    },
    (req, res) => {
        let data = req.body;
        let addressId = 1;
        let nativePlaceId = 1;
        let castId = 1;
        let FamilyId = 1;

        const addressInsertObj = {
            Address : data.address,
            CityOrVillageName : data.city,
            DistrictName:data.district,
            StateName:data.state,
            CountryName:data.country,
            PinCode:data.pincode,
            Phone1:data.phone
        }
         addressMaster
            .create(addressInsertObj)
            .then(async (respInsert) => {
                if (respInsert) {
                    addressId = respInsert.dataValues.AddressId;
                    await getCastIdFromCastName(data.cast).then((res)=>{
                        castId = res
                    }).catch((err)=>{
                        console.log(err)
                    })
                    await getNativePlaceIdFromCastName(data.nativePlaceMaster).then((res)=>{
                        nativePlaceId = res
                    }).catch((err)=>{
                        console.log(err)
                    })
                    let familyMasterInsertObj = {
                        IsDaughterFamily:1,
                        ParentId:1,
                        OldFamilyId:1,
                        ResidenceAddressId:addressId,
                        NativePlaceId:nativePlaceId,
                        CastId:castId
                    }
                    familyMaster
                        .create(familyMasterInsertObj).then((resOfInsert)=>{
                            if(resOfInsert){
                                console.log(resOfInsert.dataValues.FamilyId)
                                return res.status(200).send({ data: resOfInsert.dataValues.FamilyId});
                            } else{
                                return res.status(201).send({ data: "family is not added"});
                            }
                    }).catch((err)=>{
                        console.log("err",err)
                        return res.status(201).send({ data: "family is not added"});
                    })

                } else{
                    return res.status(201).send({ data: "not able to add family"});
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status(201).send({ data: "not able to add family"});
            });


    }
);
router.get(
    "/getFamilyDetailList",
    (req, res) => {
        getAllFamilyWiseDetails().then((familyDetails)=>{
            if(familyDetails){
                return res.status(200).send({"data":familyDetails})
            } else {
                return res.status(201).send({"data":"data not found"})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(201).send({"data":"data not found"})
        })


    }
);

router.post(
    "/addNewVoter",(req,res,next)=>{
        let data = req.body;
        if (!isDefined(data.firstName)) {
            return res.status(201).send({ data: "please enter a firstName"});
        }
        else if (!isDefined(data.middleName)) {
            return res.status(201).send({ data: "please enter a middleName"});
        }
        else if (!isDefined(data.lastName)) {
            return res.status(201).send({ data: "please enter a lastName"});
        }
        else if (!isDefined(data.email)) {
            return res.status(201).send({ data: "please enter a email"});
        }
        else if (!isDefined(data.mobile)) {
            return res.status(201).send({ data: "please enter a mobile"});
        }
        else if (!isDefined(data.age)) {
            return res.status(201).send({ data: "please enter a valid voter age"});
        }
        else if (!isDefined(data.familyId)) {
            return res.status(201).send({ data: "please enter a familyId"});
        }
        else if (!isDefined(data.gender)) {
            return res.status(201).send({ data: "please enter a home phone gender"});
        }
        else if (!isDefined(data.isAlive)) {
            return res.status(201).send({ data: "please enter a native isAlive"});
        }
      next()

    },
    (req, res) => {
        let data = req.body;
        console.log("bodyy--",data)
        const condition = { Mobile: { [Op.eq]: `${data.mobile}` } };
        voterMaster.findAll({attributes:["VoterId"],where:condition}).then((checkUserExist)=>{
            if(checkUserExist.length === 0){
                let voterInsertObj = {
                    FirstName:data.firstName,
                    MiddleName:data.middleName,
                    LastName:data.lastName,
                    Email:data.email,
                    Mobile:data.mobile,
                    Gender:data.gender,
                    Password:'123456',
                    FamilyId:data.familyId,
                    IsInfluencer:data.influencer,
                    VoterVotingId:data.voterId,
                    DOB:data.DOB,
                    TrustFactorId: data.trustFactorId,
                    Age:data.age
                }
                if(isDefined(data.profileImage)){
                    voterInsertObj = {...voterInsertObj,ProfileImage:data.profileImage}
                }
                console.log(voterInsertObj)
                if(data.isNewFamily){
                    voterMaster.create(voterInsertObj).then((resOfInsert)=>{
                        if(resOfInsert){
                            familyMaster
                                .update({ HeadId: resOfInsert.dataValues.VoterId}, { where: { FamilyId: data.familyId } }).then((updateRes)=>{
                                if(updateRes){
                                    console.log("updated");
                                    return res.status(200).send({"data":"Voter Added succesfully"})
                                } else{
                                    return res.status(201).send({"data":"failed to add voter"})
                                }
                            }).catch((err)=>{
                                return res.status(201).send({"data":"failed to add voter"})
                            })
                        }else{
                            return res.status(201).send({"data":"failed to add voter"})
                        }
                    }).catch((err)=>{
                        return res.status(201).send({"data":"failed to add voter"})
                    })
                } else{
                    voterMaster.create(voterInsertObj).then((resOfInsert)=>{
                        if(resOfInsert){
                            return res.status(200).send({"data":resOfInsert.dataValues.VoterId})
                        }else{
                            return res.status(201).send({"data":"failed to add voter"})
                        }
                    }).catch((err)=>{
                        return res.status(201).send({"data":"failed to add voter"})
                    })
                }
            } else {
                return res.status(201).send({"data":"failed to add voter..phone number already in use"})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(201).send({"data":"failed to add voterrr"})
        })
    }
);

router.get(
    "/",
    (req, res) => {
      return res.status(200).send({"message":"hello world"})
    }
);
router.post("/searchMember", async (req, res) => {
    const name = req.body;
    const charCheck = name.nameTxt.search(
        /^[A-Za-z0-9\(\)\-\=\+\.\`\~\?\!\@\#\$\%\^\&\*\ \)\(+\=\._-]+$/g
    );
    if (charCheck === 0) {
        searchData(name.nameTxt).then((result) => {
            return res.send(result);
        });
    } else {
        return res.send([]);
    }
});


router.post("/getFamilyTreeInformation", async (req, res) => {
    getFamilyTreeData(req.body.familyId).then(async (treeData)=>{
        if(treeData){

            return res.status(200).send({data:treeData});
        } else{
            return res.status(200).send({data:"no data found"});
        }
    }).catch((err)=>{
        return res.status(200).send({data:"no data found"});
    })

});

router.post(
    "/updateUserProfile",
    (request, response, next) => {
        console.log("trying to update profile");
        if (!request.body.userDataObj) {
            return response
                .status(202)
                .send({ data: "Please Provide Member Details" });
        }
        next();
    },
    async (request, response) => {
        let tokenData = "";
        await decodeDataFromAccessToken(request.headers.token).then((res) => {
            tokenData = res;
        });
        await updateUserProfile(tokenData.voterId, request.body.userDataObj).then(
            async (dataUpdated) => {
                if (!dataUpdated) {
                    return response
                        .status(202)
                        .send({ data: "Member Not Found Or Please Provide Valid Data" });
                }
                return response.status(200).send({
                    data: "Data Updated!",
                    message: dataUpdated.message,
                    // role: dataUpdated.role,
                });
            }
        );
    }
);
const tempArray=[
    {"name":"mukesh bhargav","middleName":"sanjay","dob":"1997-3-21","gender":"male","voterVotingId":"1","boothId":"1","address":"a-83,hira nagar"},
    {"name":"sanjay","middleName":"manekchand","dob":"1997-3-21","gender":"male","voterVotingId":"2","boothId":"1","address":"a-84,hira nagar"},
    {"name":"manekchand sharma","middleName":"mahendra","dob":"1997-3-21","gender":"male","voterVotingId":"3","boothId":"1","address":"a-84,hira nagar"},
    {"name":"sakhi","middleName":"ramesh","dob":"1997-3-21","gender":"female","voterVotingId":"4","boothId":"2","address":"a-85,hira nagar"},
    {"name":"neha","middleName":"varun kumar","dob":"1997-3-21","gender":"female","voterVotingId":"5","boothId":"2","address":"a-85,hira nagar"},
    {"name":"suman","middleName":"amit","dob":"1997-3-21","gender":"female","voterVotingId":"6","boothId":"2","address":"a-85,hira nagar"},
    {"name":"manju sharma","middleName":"krishna devi","dob":"1997-3-21","gender":"female","voterVotingId":"7","boothId":"3","address":"a-86,hira nagar"},
    {"name":"sonal","middleName":"sunil","dob":"1997-3-21","gender":"female","voterVotingId":"8","boothId":"3","address":"a-86,hira nagar"},
    {"name":"aarti antil","middleName":"ajay","dob":"1997-3-21","gender":"female","voterVotingId":"9","boothId":"3","address":"a-86,hira nagar"},
    {"name":"juhi verma","middleName":"hari prakash","dob":"1997-3-21","gender":"female","voterVotingId":"10","boothId":"4","address":"a-87,hira nagar"},
    {"name":"nisha","middleName":"krushna","dob":"1997-3-21","gender":"female","voterVotingId":"11","boothId":"4","address":"a-87,hira nagar"},
    {"name":"monika","middleName":"ankit","dob":"1997-3-21","gender":"female","voterVotingId":"12","boothId":"4","address":"a-87,hira nagar"},
    {"name":"dipak","middleName":"ram kishor","dob":"1997-3-21","gender":"male","voterVotingId":"13","boothId":"4","address":"a-88,hira nagar"}
]
router.post("/addBulkData", async (req, res) => {
    // console.log(req.body.csvData)
    insertBulkDataInDb(req.body.csvData).then( (isAllInserted)=>{
        if(isAllInserted){
            insertBulkDataInDb(req.body.csvData).then((res1)=>{
                insertBulkDataInDb(req.body.csvData).then((res2)=>{
                    return res.status(200).send({data:"data Added Scussfully"});
                })
            })
            // return res.status(200).send({data:"data Added Scussfully"});
        } else{
            return res.status(201).send({data:"not able to add data"});
        }
    }).catch((err)=>{
        return res.status(201).send({data:"not able to add data"});
    })

});

router.get("/getTemplateCategory", async (req, res) => {
    getTemplateCategory().then((data)=>{
        if(data){
            return res.status(200).send({data:data});
        } else {
            return res.status(201).send({data:"no data found"});
        }
    }).catch((err)=>{
        return res.status(201).send({data:"no data found"});
    })
});
router.post("/addNewTemplate", async (req, res) => {
    addNewTemplate(req.body).then((data)=>{
        if(data){
            return res.status(200).send({data:"Added"});
        } else {
            return res.status(201).send({data:"Fail To Add"});
        }
    }).catch((err)=>{
        return res.status(201).send({data:"Fail To Add"});
    })
});
module.exports = router;
