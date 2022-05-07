const {insertBulkDataInDbForWeb,getAllInclunecerMembers,insertNewBooth,getAllBooths,updateVoterElectionStatus,getVoterWhoDoesVote,getVoterWhoDoesNotVote,updateVolunteerElectionStatus,getVolunteerElection,getElectionWithoutVolunteer,getAllElectionList,addNewTemplate,getTemplateCategory,insertBulkDataInDb,searchData,filterData,getEventInformation,getSpecificMemberDetail,updateUserProfile,getFamilyTreeData,
    insertBulkVoterList,
    getVoterList
} = require("../handler/voterData");
const {getUserRole,sort_by_key,fetchAllBoothName,fetchAllTrustFactor,fetchAllOccupation,getAllNativePlace,fetchAllCastName,fetchAllNativePlace,fetchAllRegion,getAllFamilyWiseDetails,getAllCast,isDefined,getCastIdFromCastName,getNativePlaceIdFromCastName} = require("../handler/common/commonMethods")
const {decodeDataFromAccessToken} = require("../handler/utils")
const loadash = require("lodash")
const express = require("express");
const http = require("https")
const fs = require("fs");
const uuid = require("uuid-v4");
const  xlsx = require('node-xlsx');
const readXlsxFile = require('read-excel-file/node');
var xlsxtojson = require("xlsx-to-json-lc");
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
const {addressMaster,familyMaster,voterMaster} = db;


router.post("/insertBulkVoterList", async (request, response) => {
    const req = request.body;
    const addBulkMethodRes = await insertBulkVoterList(req.data);
    if(addBulkMethodRes){
        return response.status(200).send({ data: 'Data added!' });
    } else {
        return  response.status(201).send({ data: "Failed to add data, please try again" });
    }
});

router.get("/getVoterList/", async (request, response) => {
    const pageNo = isDefined(request.query.pageNo) ? request.query.pageNo : 1;
    const limit = isDefined(request.query.limit) ? request.query.limit : 50;
    const searchKey = isDefined(request.query.searchKey)?request.query.searchKey:'';

    console.log(pageNo, limit, searchKey,request.query)

    const voterList = await getVoterList(parseInt(pageNo),parseInt(limit),searchKey);
    if(voterList){
        response.status(200).send({ data: voterList });
    } else {
        response.status(201).send({ data: 'data not found' });
    }
});


router.post("/filterData", async (request, response) => {
    const req = request.body;
    let tokenData = null;
    await decodeDataFromAccessToken(request.headers.token).then((res) => {
        tokenData = res;
    });
    if(tokenData === null){
        return response.send([]);
    } else {
        if (isDefined(req.sortingCreteria)) {
            filterData(req.filterFields, req.sortingCreteria,tokenData.voterId).then((result) => {
                return response.send(result);
            });
        } else {
            filterData(req.filterFields,null,tokenData.voterId).then((result) => {
                return response.send(result);
            });
        }
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
    async (req, res) => {
        let offset = 0;
        let page = 0;
        let tokenData = null;
        await decodeDataFromAccessToken(req.headers.token).then((res) => {
            if (res) {
                tokenData = res;
            }
        });
        if(tokenData === null){
            return res
                .status(202)
                .send({ data: "data not found", next_endpoint: "null" });
        } else {
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
            getMemberData(offset, page,tokenData.voterId)
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
        else if (!isDefined(data.boothId)) {
            return res.status(201).send({ data: "please enter a booth id"});
        }
        next()

    },
    (req, res) => {
        let data = req.body;
        const condition = { Email: { [Op.eq]: `${data.email}` } };
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
                    Age:data.age,
                    BoothId:data.boothId,
                    IsOurVolunteer:isDefined(data.ourVolunteer)?data.ourVolunteer:null
                }
                if(isDefined(data.profileImage)){
                    voterInsertObj = {...voterInsertObj,ProfileImage:data.profileImage}
                }
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
    let tokenData = null;
    await decodeDataFromAccessToken(req.headers.token).then((res) => {
        tokenData = res;
    });
    if(tokenData === null){
        return res.send([]);
    } else {
        if (charCheck === 0) {
            searchData(name.nameTxt,tokenData.voterId).then((result) => {
                return res.send(result);
            });
        } else {
            return res.send([]);
        }
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
                return res.status(200).send({data:"data Added Scussfully"});
                // insertBulkDataInDb(req.body.csvData).then((res2)=>{
                //     return res.status(200).send({data:"data Added Scussfully"});
                // })
            })
        } else{
            return res.status(201).send({data:"not able to add data"});
        }
    }).catch((err)=>{
        return res.status(201).send({data:"not able to add data"});
    })

});

router.post("/addBulkDataFromWeb",(req,res,next)=>{
    if (!req.body.fileUrl) {
        return res
            .status(201)
            .send({ data: "Please Provide Valid File" });
    }
    next();
}, async (req, res) => {
    // console.log(req.body.csvData)
    const fileName = "EXCEL/"+"EXCEL_"+new Date().getTime()+".xlsx"
    const file = fs.createWriteStream(fileName);
    const tempArray = [{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"861","HouseNoEN":"1053","HouseNo":"1053","VoterNameEn":"RAJU RAM BAAVARI","VoterName":"राजूराम बावरी","RelayionType":"F","RelationName":"HUKMA RAM BAWARI","RelationName2":"हुक्मा राम बावरी","VoterId":"AZB1080647","Sex":"M","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"862","HouseNoEN":"1053","HouseNo":"1053","VoterNameEn":"BHERU RAM CHOKIDAR","VoterName":"भेरूराम चोकिदार","RelayionType":"M","RelationName":"JAI RAM CHOKIDAAR","RelationName2":"जयराम चोकिदार","VoterId":"AZB1079052","Sex":"M","Age":"24","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"863","HouseNoEN":"1053","HouseNo":"1053","VoterNameEn":"SHANTI DEVI","VoterName":"शांति देवी","RelayionType":"H","RelationName":"BHERU RAM","RelationName2":"भेरूराम","VoterId":"AZB1076462","Sex":"F","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"864","HouseNoEN":"1053","HouseNo":"1053","VoterNameEn":"MUKESH  CHOKIDAAR","VoterName":"मुकेश चोकिदार","RelayionType":"F","RelationName":"JAI RAM CHOKIDAR","RelationName2":"जयराम चोकिदार","VoterId":"AZB1080696","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"865","HouseNoEN":"1053","HouseNo":"1053","VoterNameEn":"BANWARI CHOKIDAAR","VoterName":"बनवारी चोकिदार","RelayionType":"F","RelationName":"HUKMARAM  CHOKIDAAR","RelationName2":"हुक्माराम चोकिदार","VoterId":"AZB1080746","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"866","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"MAGANIDEVI","VoterName":"मगनीदेवी","RelayionType":"H","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"RJ/25/194/093508","Sex":"F","Age":"64","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"867","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"PRAKASH","VoterName":"प्रकाश","RelayionType":"F","RelationName":"NATHURAM","RelationName2":"नाथुराम","VoterId":"MTW3504321","Sex":"M","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"868","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"LICHHAMANARAM","VoterName":"लिछमणराम","RelayionType":"F","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"MTW1584721","Sex":"M","Age":"38","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"869","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"CHUKA DEVI","VoterName":"चुका देवी","RelayionType":"H","RelationName":"DHANNARAM","RelationName2":"धन्नाराम","VoterId":"AZB0279067","Sex":"F","Age":"38","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"870","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"PARVATIDEVI","VoterName":"पार्वतीदेवी","RelayionType":"H","RelationName":"PRAKASH","RelationName2":"प्रकाश","VoterId":"AZB0011148","Sex":"F","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"871","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"MUNNIDEVI","VoterName":"मुन्नीदेवी","RelayionType":"H","RelationName":"LICHHAMANARAM","RelationName2":"लिछमणराम","VoterId":"MTW1490804","Sex":"F","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"872","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"REVATA RAM BAVARI","VoterName":"रेवता राम बावरी","RelayionType":"F","RelationName":"NATHU RAM","RelationName2":"नाथु राम","VoterId":"AZB0266130","Sex":"M","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"873","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"OMARAM","VoterName":"ओमाराम","RelayionType":"F","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"AZB0279059","Sex":"M","Age":"33","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"874","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"SUNITA","VoterName":"सुनीता","RelayionType":"H","RelationName":"OMA RAM","RelationName2":"ओमा राम","VoterId":"AZB0576389","Sex":"F","Age":"31","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"875","HouseNoEN":"","HouseNo":"1054","VoterNameEn":"CHUKADEVI","VoterName":"चुकादेवी .","RelayionType":"H","RelationName":"REVATARAM","RelationName2":"रेवताराम .","VoterId":"AZB0740357","Sex":"F","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"876","HouseNoEN":"1054","HouseNo":"1054","VoterNameEn":"GHANSHYAM","VoterName":"घनश्याम","RelayionType":"F","RelationName":"MOTIRAM","RelationName2":"मोतीराम","VoterId":"AZB0921908","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"877","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"MULADEVI","VoterName":"मूलादेवी","RelayionType":"H","RelationName":"CHANDURAM","RelationName2":"चान्दूराम","VoterId":"MTW1193333","Sex":"F","Age":"82","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"878","HouseNoEN":"1054K","HouseNo":"1054क","VoterNameEn":"DHANA RAM","VoterName":"धना राम","RelayionType":"F","RelationName":"ARJANA RAM","RelationName2":"अर्जना राम","VoterId":"AZB0265694","Sex":"M","Age":"60","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"879","HouseNoEN":"1054K","HouseNo":"1054क","VoterNameEn":"SAROJ","VoterName":"सरोज","RelayionType":"H","RelationName":"JAGADISH","RelationName2":"जगदीश","VoterId":"MTW3504214","Sex":"F","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"880","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"LUNARAM","VoterName":"लूणाराम","RelayionType":"F","RelationName":"DHANNARAM","RelationName2":"धन्नाराम","VoterId":"AZB0279075","Sex":"M","Age":"38","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"881","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"CHENARAM","VoterName":"चेनाराम","RelayionType":"F","RelationName":"DHANNARAM","RelationName2":"धन्नाराम","VoterId":"AZB0279091","Sex":"M","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"882","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"GITA DEVI","VoterName":"गीता देवी","RelayionType":"H","RelationName":"LUNARAM","RelationName2":"लूणाराम","VoterId":"AZB0279083","Sex":"F","Age":"33","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"883","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"SUGANA","VoterName":"सुगना","RelayionType":"H","RelationName":"CHENARAM","RelationName2":"चेनाराम","VoterId":"AZB0279109","Sex":"F","Age":"31","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"884","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"KAILASH","VoterName":"कैलाश","RelayionType":"F","RelationName":"DHANNARAM","RelationName2":"धन्नाराम","VoterId":"AZB0279117","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"885","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"ANJU DEVI","VoterName":"अंजू देवी","RelayionType":"H","RelationName":"KAILASH","RelationName2":"कैलाश","VoterId":"AZB0279125","Sex":"F","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"886","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"RAMANIVAS","VoterName":"रामनिवास","RelayionType":"F","RelationName":"DHANNARAM","RelationName2":"धन्नाराम","VoterId":"AZB0279133","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"887","HouseNoEN":"1054 K","HouseNo":"1054 क","VoterNameEn":"JASODA DEVI","VoterName":"जसोदा देवी","RelayionType":"O","RelationName":"RAMANIVAS","RelationName2":"रामनिवास","VoterId":"AZB0279141","Sex":"F","Age":"28","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"888","HouseNoEN":"1054K","HouseNo":"1054क","VoterNameEn":"RAKESH KUMAR","VoterName":"राकेश कुमार","RelayionType":"F","RelationName":"JAGADISH RAM","RelationName2":"जगदीश राम","VoterId":"AZB0464305","Sex":"M","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"889","HouseNoEN":"1055","HouseNo":"1055","VoterNameEn":"KAILARAM","VoterName":"कैलाराम","RelayionType":"F","RelationName":"HANUMANARAM","RelationName2":"हनुमानराम","VoterId":"MTW3503208","Sex":"M","Age":"50","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"890","HouseNoEN":"1055","HouseNo":"1055","VoterNameEn":"KISANADEVI","VoterName":"किसनादेवी","RelayionType":"H","RelationName":"KAILARAM","RelationName2":"कैलाराम","VoterId":"MTW3504438","Sex":"F","Age":"49","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"891","HouseNoEN":"1055","HouseNo":"1055","VoterNameEn":"MANJU DEVI","VoterName":"मंजू देवी","RelayionType":"H","RelationName":"DEVILAL","RelationName2":"देवीलाल","VoterId":"AZB0279158","Sex":"F","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"892","HouseNoEN":"1055","HouseNo":"1055","VoterNameEn":"DEVILAL","VoterName":"देवीलाल","RelayionType":"F","RelationName":"KAILASH RAM","RelationName2":"कैलाश राम","VoterId":"AZB0235077","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"893","HouseNoEN":"1055","HouseNo":"1055","VoterNameEn":"GHANSHYAM","VoterName":"घनश्याम","RelayionType":"F","RelationName":"KELASH RAM","RelationName2":"कैलाश राम","VoterId":"AZB1095363","Sex":"M","Age":"19","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"894","HouseNoEN":"1056","HouseNo":"1056","VoterNameEn":"CHUKALI","VoterName":"चुकली","RelayionType":"H","RelationName":"HANUMANARAM","RelationName2":"हनुमानाराम","VoterId":"AZB0279174","Sex":"F","Age":"83","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"895","HouseNoEN":"1056","HouseNo":"1056","VoterNameEn":"KISHORARAM","VoterName":"किशोरराम","RelayionType":"F","RelationName":"HANUMANARAM","RelationName2":"हनुमानाराम","VoterId":"MTW1490812","Sex":"M","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"896","HouseNoEN":"1056","HouseNo":"1056","VoterNameEn":"KELUDIDEVI","VoterName":"केलुडीदेवी","RelayionType":"H","RelationName":"KISHORARAM","RelationName2":"किशोरराम","VoterId":"MTW1705904","Sex":"F","Age":"46","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"897","HouseNoEN":"1056","HouseNo":"1056","VoterNameEn":"SITARAM","VoterName":"सीताराम","RelayionType":"F","RelationName":"KISHOR RAM","RelationName2":"किशोर राम","VoterId":"AZB0235044","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"898","HouseNoEN":"1056","HouseNo":"1056","VoterNameEn":"SANJU DEVI","VoterName":"संजू देवी","RelayionType":"H","RelationName":"SITARAM","RelationName2":"सीताराम","VoterId":"AZB0279166","Sex":"F","Age":"28","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"899","HouseNoEN":"","HouseNo":"1056","VoterNameEn":"BHIYARAM","VoterName":"भीयाराम .","RelayionType":"F","RelationName":"KISHOR RAM","RelationName2":"किशोर राम .","VoterId":"AZB0740407","Sex":"M","Age":"23","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"900","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"BHIKARAM","VoterName":"भीकाराम","RelayionType":"F","RelationName":"CHUNARAM","RelationName2":"चूनाराम","VoterId":"RJ/25/194/093049","Sex":"M","Age":"56","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"901","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"GHEVARIDEVI","VoterName":"घेवरीदेवी","RelayionType":"H","RelationName":"BHIKARAM","RelationName2":"भीकाराम","VoterId":"RJ/25/194/093359","Sex":"F","Age":"54","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"902","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"PRAHALAD","VoterName":"प्रहलाद","RelayionType":"F","RelationName":"BHIKARAM","RelationName2":"भीकाराम","VoterId":"MTW1584739","Sex":"M","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"903","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"RAJU DEVI","VoterName":"राजू देवी","RelayionType":"H","RelationName":"PRAHALAD","RelationName2":"प्रहलाद","VoterId":"MTW1584747","Sex":"F","Age":"34","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"904","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"SHRAVANARAM","VoterName":"श्रवणराम","RelayionType":"F","RelationName":"BHIKARAM","RelationName2":"भीकाराम","VoterId":"AZB0279182","Sex":"M","Age":"32","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"905","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"MAINA","VoterName":"मैना","RelayionType":"H","RelationName":"SHRAVANARAM","RelationName2":"श्रवणराम","VoterId":"AZB0279190","Sex":"F","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"906","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"TARACHAND","VoterName":"ताराचन्द","RelayionType":"F","RelationName":"BHIKARAM","RelationName2":"भीकाराम","VoterId":"AZB0279208","Sex":"M","Age":"27","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"907","HouseNoEN":"","HouseNo":"1057","VoterNameEn":"LIKHAMARAM","VoterName":"लिखमाराम .","RelayionType":"F","RelationName":"BHIKARAM","RelationName2":"भीकाराम .","VoterId":"AZB0740399","Sex":"M","Age":"24","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"908","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"MEHRAMA RAM","VoterName":"मेहरामा राम","RelayionType":"F","RelationName":"BHIKHA RAM","RelationName2":"भीखा राम","VoterId":"AZB1094671","Sex":"M","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"909","HouseNoEN":"1057","HouseNo":"1057","VoterNameEn":"SURGYAN DEVI","VoterName":"सुर्ज्ञान देवी","RelayionType":"H","RelationName":"MEHRAM","RelationName2":"मेहराम","VoterId":"AZB1095033","Sex":"F","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"910","HouseNoEN":"1058","HouseNo":"1058","VoterNameEn":"RUPARAM","VoterName":"रूपाराम","RelayionType":"F","RelationName":"KUNARAM","RelationName2":"कुनाराम","VoterId":"RJ/25/194/093134","Sex":"M","Age":"50","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"911","HouseNoEN":"1058","HouseNo":"1058","VoterNameEn":"PANCHIDEVI","VoterName":"पांचीदेवी","RelayionType":"H","RelationName":"RUPARAM","RelationName2":"रूपाराम","VoterId":"RJ/25/194/093360","Sex":"F","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"912","HouseNoEN":"1058","HouseNo":"1058","VoterNameEn":"RAJU RAM","VoterName":"राजू राम","RelayionType":"F","RelationName":"ROOPA RAM","RelationName2":"रूपा राम","VoterId":"AZB0788133","Sex":"M","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"913","HouseNoEN":"1058","HouseNo":"1058","VoterNameEn":"CHUKLI DEVI","VoterName":"चुकली देवी","RelayionType":"H","RelationName":"RAJU RAM","RelationName2":"राजू राम","VoterId":"AZB0849596","Sex":"F","Age":"24","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"914","HouseNoEN":"1059","HouseNo":"1059","VoterNameEn":"PREMARAM","VoterName":"प्रेमाराम","RelayionType":"F","RelationName":"KUNARAM","RelationName2":"कुनाराम","VoterId":"AZB0310045","Sex":"M","Age":"47","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"915","HouseNoEN":"1059","HouseNo":"1059","VoterNameEn":"SANTOSHADEVI","VoterName":"सन्तोषदेवी","RelayionType":"H","RelationName":"PREMARAM","RelationName2":"प्रेमाराम","VoterId":"RJ/25/194/093602","Sex":"F","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"916","HouseNoEN":"1060","HouseNo":"1060","VoterNameEn":"CHHOTUDI","VoterName":"छोटूडी","RelayionType":"H","RelationName":"SOHANALAL","RelationName2":"सोहनलाल","VoterId":"RJ/25/194/093500","Sex":"F","Age":"52","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"917","HouseNoEN":"1060","HouseNo":"1060","VoterNameEn":"BUDHARAM","VoterName":"बुधाराम","RelayionType":"F","RelationName":"SOHAN LAL","RelationName2":"सोहन लाल","VoterId":"AZB0055798","Sex":"M","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"918","HouseNoEN":"1060","HouseNo":"1060","VoterNameEn":"BALA DEVI","VoterName":"बाला देवी","RelayionType":"H","RelationName":"BUDHARAM","RelationName2":"बुधाराम","VoterId":"AZB0011353","Sex":"F","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"919","HouseNoEN":"1060","HouseNo":"1060","VoterNameEn":"HARADIN RAM","VoterName":"हरदीन राम","RelayionType":"F","RelationName":"SOHAN LAL","RelationName2":"सोहन लाल","VoterId":"AZB0404459","Sex":"M","Age":"35","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"920","HouseNoEN":"1060","HouseNo":"1060","VoterNameEn":"MADANI DEVI","VoterName":"मदनी देवी","RelayionType":"H","RelationName":"HARADIN RAM","RelationName2":"हरदीन राम","VoterId":"AZB0011403","Sex":"F","Age":"34","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"921","HouseNoEN":"1061","HouseNo":"1061","VoterNameEn":"BIRABALARAM","VoterName":"बीरबलराम","RelayionType":"F","RelationName":"KUNARAM","RelationName2":"कुनाराम","VoterId":"MTW3503398","Sex":"M","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"922","HouseNoEN":"1061","HouseNo":"1061","VoterNameEn":"JETUDIDEVI","VoterName":"जेतूड़ीदेवी","RelayionType":"H","RelationName":"BIRABALARAM","RelationName2":"बीरबलराम","VoterId":"MTW3503745","Sex":"F","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"923","HouseNoEN":"1062","HouseNo":"1062","VoterNameEn":"SHANTIDEVI","VoterName":"शांतीदेवी","RelayionType":"H","RelationName":"GHASIRAM","RelationName2":"घासीराम","VoterId":"AZB0011361","Sex":"F","Age":"52","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"924","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"BHANVARIDEVI","VoterName":"भंवरीदेवी","RelayionType":"H","RelationName":"BHANVARALAL","RelationName2":"भंवरलाल","VoterId":"MTW3504701","Sex":"F","Age":"57","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"925","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"MOTARAM","VoterName":"मोटाराम","RelayionType":"F","RelationName":"BHANVARALAL","RelationName2":"भंवरलाल","VoterId":"MTW3504552","Sex":"M","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"926","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"MANJU","VoterName":"मंजू","RelayionType":"H","RelationName":"MOTARAM","RelationName2":"मोटाराम","VoterId":"MTW3503737","Sex":"F","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"927","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"DAYALARAM","VoterName":"दयालराम","RelayionType":"F","RelationName":"BHANVARALAL","RelationName2":"भँवरलाल","VoterId":"AZB0011684","Sex":"M","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"928","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"RATANI DEVI","VoterName":"रतनी देवी","RelayionType":"H","RelationName":"DIYAL RAM","RelationName2":"दियाल राम","VoterId":"AZB0056408","Sex":"F","Age":"35","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"929","HouseNoEN":"1063","HouseNo":"1063","VoterNameEn":"SUKHADEV","VoterName":"सुखदेव","RelayionType":"F","RelationName":"BHANVARALAL","RelationName2":"भंवरलाल","VoterId":"AZB0279216","Sex":"M","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"930","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"RAMAPAL","VoterName":"रामपाल","RelayionType":"F","RelationName":"MADHURAM","RelationName2":"माधूराम","VoterId":"RJ/25/194/093609","Sex":"M","Age":"66","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"931","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"DHANIDEVI","VoterName":"धनीदेवी","RelayionType":"H","RelationName":"RAMAPAL","RelationName2":"रामपाल","VoterId":"RJ/25/194/093499","Sex":"F","Age":"62","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"932","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"SHRAVAN KUMAR","VoterName":"श्रवण कुमार","RelayionType":"F","RelationName":"RAMAPAL","RelationName2":"रामपाल","VoterId":"AZB0011411","Sex":"M","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"933","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"UGAMA RAM","VoterName":"उगमा राम","RelayionType":"F","RelationName":"TEJA RAM","RelationName2":"तेजा राम","VoterId":"AZB0576173","Sex":"M","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"934","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"NARBADA DEVI","VoterName":"नर्बदा देवी","RelayionType":"H","RelationName":"SHRAVAN KUMAR","RelationName2":"श्रवण कुमार","VoterId":"AZB0011429","Sex":"F","Age":"40","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"935","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"MUNI","VoterName":"मुनी","RelayionType":"H","RelationName":"UGAMA RAM","RelationName2":"उगमा राम","VoterId":"AZB0576223","Sex":"F","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"936","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"PARAMESHWAR","VoterName":"परमेश्वर","RelayionType":"F","RelationName":"RAMAPAL","RelationName2":"रामपाल","VoterId":"AZB0279224","Sex":"M","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"937","HouseNoEN":"1064","HouseNo":"1064","VoterNameEn":"RADHA DEVI","VoterName":"राधा देवी","RelayionType":"H","RelationName":"PARAMESHWAR","RelationName2":"परमेश्वर","VoterId":"AZB0279232","Sex":"F","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"938","HouseNoEN":"1064 K","HouseNo":"1064के","VoterNameEn":"PREM DEVI","VoterName":"प्रेम देवी","RelayionType":"H","RelationName":"BANSHI LAL","RelationName2":"बंशी लाल","VoterId":"AZB1080209","Sex":"F","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"939","HouseNoEN":"1064 K","HouseNo":"1064के","VoterNameEn":"BANSHI LAL","VoterName":"बंशी लाल","RelayionType":"F","RelationName":"SHARWAN RAM","RelationName2":"श्रवण राम","VoterId":"AZB1080779","Sex":"M","Age":"45","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"940","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"MURADABANU","VoterName":"मुरादबानू","RelayionType":"H","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093404","Sex":"F","Age":"74","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"941","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"MAHABUB ALI","VoterName":"महबूब अली","RelayionType":"F","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093229","Sex":"M","Age":"52","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"942","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"ALAHADIN","VoterName":"अलाहदीन","RelayionType":"F","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093427","Sex":"M","Age":"50","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"943","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"MAHARUNABANA","VoterName":"महरूनबाना","RelayionType":"H","RelationName":"ALAHADIN","RelationName2":"अलाहदीन","VoterId":"RJ/25/194/093570","Sex":"F","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"944","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"KASAM ALI","VoterName":"कासम अली","RelayionType":"F","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093569","Sex":"M","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"945","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"RAMAJANAALI","VoterName":"रमजानअली","RelayionType":"F","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093406","Sex":"M","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"946","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"ABIDABANU","VoterName":"आबीदाबानू","RelayionType":"H","RelationName":"RAMAJANAALI","RelationName2":"रमजानअली","VoterId":"RJ/25/194/093403","Sex":"F","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"947","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"NABABAALI","VoterName":"नबाबअली","RelayionType":"F","RelationName":"RUSTAMAALI","RelationName2":"रूस्तमअली","VoterId":"RJ/25/194/093579","Sex":"M","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"948","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"BALAKESH","VoterName":"बलकेश","RelayionType":"H","RelationName":"KASAM","RelationName2":"कासम","VoterId":"MTW1490820","Sex":"F","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"949","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"SAJIDA","VoterName":"साजीदा","RelayionType":"H","RelationName":"NABABAALI","RelationName2":"नबाबअली","VoterId":"MTW1490838","Sex":"F","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"950","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"ABDUL SALAM","VoterName":"अब्दुल सलाम","RelayionType":"F","RelationName":"MAHABUB ALI","RelationName2":"महबुब अली","VoterId":"MTW1584754","Sex":"M","Age":"35","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"951","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"SAYARA BANU","VoterName":"सायरा बानू","RelayionType":"H","RelationName":"ABDUL SALAM","RelationName2":"अब्दुल सलाम","VoterId":"AZB0464461","Sex":"F","Age":"32","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"952","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"AKARAM","VoterName":"अकरम","RelayionType":"F","RelationName":"ALLAHADIN","RelationName2":"अल्लाहदीन","VoterId":"AZB0421594","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"953","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"INSAF ALISHEKH","VoterName":"इंसाफ अलीशेख","RelayionType":"F","RelationName":"MAHABUB ALI","RelationName2":"महबूब अली","VoterId":"AZB0279257","Sex":"M","Age":"27","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"954","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"SADDHAM HUSAIN","VoterName":"सद्धाम हुसैन","RelayionType":"F","RelationName":"ALAHADIN","RelationName2":"अलाहदीन","VoterId":"AZB0532135","Sex":"M","Age":"27","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"955","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"HAKIM ALI","VoterName":"हकिम अली","RelayionType":"F","RelationName":"MAHABUB ALI","RelationName2":"महबुब अली","VoterId":"AZB0421545","Sex":"M","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"956","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"SUMAN BANU","VoterName":"सुमन बानू","RelayionType":"H","RelationName":"ISAF ALI","RelationName2":"ईसाफ अली","VoterId":"AZB0464479","Sex":"F","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"957","HouseNoEN":"","HouseNo":"1065","VoterNameEn":"RAJARAM SANT","VoterName":"राजाराम संत .","RelayionType":"F","RelationName":"HANSARAJ","RelationName2":"हंसराज .","VoterId":"AZB0739607","Sex":"M","Age":"23","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"958","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"ABID ALI","VoterName":"आबिद अली","RelayionType":"F","RelationName":"MAHBUB ALI","RelationName2":"महबुब अली","VoterId":"AZB0788240","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"959","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"SAJID ALI","VoterName":"साजिद अली","RelayionType":"F","RelationName":"ALLAH DEEN","RelationName2":"अल्लाह दीन","VoterId":"AZB0788257","Sex":"M","Age":"21","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"960","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"NASIM BANO","VoterName":"नसीम बानो","RelayionType":"H","RelationName":"AVID ALI","RelationName2":"आविद अली","VoterId":"AZB0921932","Sex":"F","Age":"21","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"961","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"JAVED AKHTAR","VoterName":"जावेद अखतर","RelayionType":"F","RelationName":"KASAM ALI","RelationName2":"कासम अली","VoterId":"AZB0921940","Sex":"M","Age":"21","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"962","HouseNoEN":"1065","HouseNo":"1065","VoterNameEn":"PRAVIN BANO","VoterName":"परवीन बानो","RelayionType":"H","RelationName":"JAVED AKHTAR","RelationName2":"जावेद अखतर","VoterId":"AZB0921957","Sex":"F","Age":"20","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"963","HouseNoEN":"1065K","HouseNo":"1065क","VoterNameEn":"SURAJARAM","VoterName":"सुरजाराम","RelayionType":"F","RelationName":"KANARAM","RelationName2":"कानाराम","VoterId":"MTW3503257","Sex":"M","Age":"70","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"964","HouseNoEN":"1065K","HouseNo":"1065क","VoterNameEn":"CHUKA DEVI","VoterName":"चुका देवी","RelayionType":"H","RelationName":"SURAJARAM","RelationName2":"सुरजाराम","VoterId":"MTW1705623","Sex":"F","Age":"62","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"965","HouseNoEN":"1065 ?","HouseNo":"1065क","VoterNameEn":"KUSUM JANGID","VoterName":"कुसुम जांगिड","RelayionType":"H","RelationName":"MUKESH JANGID","RelationName2":"मुकेश जांगिड","VoterId":"AZB1012145","Sex":"F","Age":"21","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"966","HouseNoEN":"1065 ?","HouseNo":"1065क","VoterNameEn":"MUKESH JANGID","VoterName":"मुकेश जांगिड","RelayionType":"F","RelationName":"SURJA RAM","RelationName2":"सुरजा राम","VoterId":"AZB1012152","Sex":"M","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"967","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"RAMAKARAN","VoterName":"रामकरण","RelayionType":"F","RelationName":"KANA RAM","RelationName2":"काना राम","VoterId":"AZB0234914","Sex":"M","Age":"75","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"968","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"NOJIDEVI","VoterName":"नोजीदेवी","RelayionType":"H","RelationName":"RAMAKARAN","RelationName2":"रामकरण","VoterId":"RJ/25/194/093577","Sex":"F","Age":"69","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"969","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"HANUMANARAM","VoterName":"हनुमानाराम","RelayionType":"F","RelationName":"RAMAKARAN","RelationName2":"रामकरण","VoterId":"RJ/25/194/093269","Sex":"M","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"970","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"MUNNIDEVI","VoterName":"मुन्नीदेवी","RelayionType":"H","RelationName":"HANUMANARAM","RelationName2":"हनुमानराम","VoterId":"MTW1584762","Sex":"F","Age":"43","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"971","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"SUKHARAM","VoterName":"सुखाराम","RelayionType":"F","RelationName":"RAMAKARAN","RelationName2":"रामकरण","VoterId":"RJ/25/194/093192","Sex":"M","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"972","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"RAJUDEVI","VoterName":"राजूदेवी","RelayionType":"H","RelationName":"SUKHARAM","RelationName2":"सुखाराम","VoterId":"RJ/25/194/093595","Sex":"F","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"973","HouseNoEN":"1066","HouseNo":"1066","VoterNameEn":"AMAR CHAND JANGID","VoterName":"अमर चन्द जाँगिड","RelayionType":"F","RelationName":"HANUMAN RAM","RelationName2":"हनुमान राम","VoterId":"AZB0921924","Sex":"M","Age":"21","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"974","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"SHANTIDEVI","VoterName":"शांतीदेवी","RelayionType":"H","RelationName":"SHANKARALAL","RelationName2":"शंकरलाल","VoterId":"RJ/25/194/093490","Sex":"F","Age":"69","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"975","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"SHRINIVAS","VoterName":"श्रीनिवास","RelayionType":"F","RelationName":"SHANKARALAL","RelationName2":"शंकरलाल","VoterId":"MTW1705417","Sex":"M","Age":"52","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"976","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"BHAGAVATI","VoterName":"भगवती","RelayionType":"H","RelationName":"SHRINIVAS","RelationName2":"श्रीनिवास","VoterId":"RJ/25/194/093491","Sex":"F","Age":"49","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"977","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"MANAKACHAND","VoterName":"माणकचन्द","RelayionType":"F","RelationName":"SHANKARALAL","RelationName2":"शंकरलाल","VoterId":"RJ/25/194/093612","Sex":"M","Age":"47","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"978","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"GITA DEVI","VoterName":"गीता देवी","RelayionType":"H","RelationName":"MANAKACHAND","RelationName2":"माणकचन्द","VoterId":"MTW1584770","Sex":"F","Age":"41","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"979","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"VIKAS","VoterName":"विकास","RelayionType":"F","RelationName":"SHRI NIVAS","RelationName2":"श्री निवास","VoterId":"AZB0849604","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"980","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"POOJA","VoterName":"पूजा","RelayionType":"H","RelationName":"VIKAS","RelationName2":"विकास","VoterId":"AZB1079334","Sex":"F","Age":"20","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"981","HouseNoEN":"1067","HouseNo":"1067","VoterNameEn":"CHENA RAM MEGHWAL","VoterName":"चेना राम मेघवाल","RelayionType":"F","RelationName":"SHREE NIVAS","RelationName2":"श्रीनिवास","VoterId":"AZB1080852","Sex":"M","Age":"19","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"982","HouseNoEN":"1067 K","HouseNo":"1067 क","VoterNameEn":"MADAN LAL","VoterName":"मदन लाल","RelayionType":"F","RelationName":"KESARAM MEGHAVAL","RelationName2":"केसाराम मेघवाल","VoterId":"AZB0325563","Sex":"M","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"983","HouseNoEN":"1067 K","HouseNo":"1067 क","VoterNameEn":"SUMAN DEVI","VoterName":"सुमन देवी","RelayionType":"H","RelationName":"MADAN LAL","RelationName2":"मदन लाल","VoterId":"AZB0325571","Sex":"F","Age":"28","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"984","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"KUTABANABANU","VoterName":"कुतबनबानू","RelayionType":"H","RelationName":"PIRAMOHAMMAD","RelationName2":"पीरमोहम्मद","VoterId":"MTW3503752","Sex":"F","Age":"75","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"985","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"KURASIDAMOHAMMAD","VoterName":"कुरसीदमोहम्मद","RelayionType":"F","RelationName":"PIRAMOHAMMAD","RelationName2":"पीरमोहम्मद","VoterId":"MTW1706340","Sex":"M","Age":"56","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"986","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"AKHATARABANU","VoterName":"अखतरबानू","RelayionType":"H","RelationName":"KURASIDAMOHAMMAD","RelationName2":"कुरसीदमोहम्मद","VoterId":"MTW3503703","Sex":"F","Age":"54","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"987","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"AKARAM","VoterName":"अकरम","RelayionType":"F","RelationName":"PIR MO","RelationName2":"पीर मो॰","VoterId":"MTW1584788","Sex":"M","Age":"51","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"988","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SALIMAMOHAMMAD","VoterName":"सलीममोहम्मद","RelayionType":"F","RelationName":"PIRAMOHAMMAD","RelationName2":"पीरमोहम्मद","VoterId":"RJ/25/194/093618","Sex":"M","Age":"49","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"989","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SAHANAJABANU","VoterName":"सहनाजबानू","RelayionType":"H","RelationName":"SALIMAMOHAMMAD","RelationName2":"सलीममोहम्मद","VoterId":"MTW0093597","Sex":"F","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"990","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"BANU","VoterName":"बानू","RelayionType":"H","RelationName":"AKARAM","RelationName2":"अकरम","VoterId":"MTW1538834","Sex":"F","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"991","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"JABARAALI","VoterName":"जबारअली","RelayionType":"F","RelationName":"PIRAMOHAMMAD","RelationName2":"पीरमोहम्मद","VoterId":"RJ/25/194/093299","Sex":"M","Age":"47","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"992","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"KAYUMAALI","VoterName":"कयुमअली","RelayionType":"F","RelationName":"PIRAMOHAMMAD","RelationName2":"पीरमोहम्मद","VoterId":"MTW1538180","Sex":"M","Age":"45","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"993","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SABINABANU","VoterName":"सबीनाबानू","RelayionType":"H","RelationName":"KAYUMAALI","RelationName2":"कयुमअली","VoterId":"MTW1054811","Sex":"F","Age":"45","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"994","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SHABANAM","VoterName":"शबनम","RelayionType":"H","RelationName":"JABARAALI","RelationName2":"जबारअली","VoterId":"MTW1538842","Sex":"F","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"995","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SHABINA","VoterName":"शबीना","RelayionType":"H","RelationName":"KAYUMAALI","RelationName2":"कयूमअली","VoterId":"MTW1054311","Sex":"F","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"996","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"SAHID MOHAMMAD","VoterName":"साहिद मोहम्मद","RelayionType":"F","RelationName":"KUSHRID MOHAMMAD","RelationName2":"कुश्रीद मोहम्मद","VoterId":"AZB0325589","Sex":"M","Age":"31","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"997","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"ID MOHAMMAD","VoterName":"ईद मोहम्मद","RelayionType":"F","RelationName":"KUSHRID MOHAMMAD","RelationName2":"कुर्शिद मोहम्मद","VoterId":"AZB0325597","Sex":"M","Age":"27","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"998","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"ASALAM KHAN","VoterName":"असलम खां","RelayionType":"F","RelationName":"AKARAM KHAN","RelationName2":"अकरम खां","VoterId":"AZB0576280","Sex":"M","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"999","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"Mohammad Akabar","VoterName":"मोहम्मद अकबर","RelayionType":"F","RelationName":"Salim Mohammad","RelationName2":"सलीम मोहम्मद","VoterId":"AZB1012111","Sex":"M","Age":"23","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1000","HouseNoEN":"1068","HouseNo":"1068","VoterNameEn":"NADEEM","VoterName":"नदीम","RelayionType":"F","RelationName":"KHURSHID MOHAMMED","RelationName2":"खुर्शीद मोहम्मद","VoterId":"AZB1095041","Sex":"M","Age":"20","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1001","HouseNoEN":"1068 K","HouseNo":"1068 क","VoterNameEn":"SIKANDAR","VoterName":"सिकन्दर","RelayionType":"F","RelationName":"PIR MOHAMMAD","RelationName2":"पीर मोहम्मद","VoterId":"AZB0325605","Sex":"M","Age":"34","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1002","HouseNoEN":"1068 K","HouseNo":"1068 क","VoterNameEn":"FIRADOS","VoterName":"फिरदोस","RelayionType":"H","RelationName":"SIKANDAR","RelationName2":"सिकन्दर","VoterId":"AZB0325613","Sex":"F","Age":"32","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1003","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"SUGANI","VoterName":"सुगनी","RelayionType":"H","RelationName":"GHISARAM","RelationName2":"घीसाराम","VoterId":"MTW1538206","Sex":"F","Age":"74","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1004","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"PRABHURAM","VoterName":"प्रभुराम","RelayionType":"F","RelationName":"GHISARAM","RelationName2":"घीसाराम","VoterId":"RJ/25/194/093066","Sex":"M","Age":"56","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1005","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"RAMESHWARI","VoterName":"रामेश्वरी","RelayionType":"H","RelationName":"PRABHURAM","RelationName2":"प्रभुराम","VoterId":"AZB0265967","Sex":"F","Age":"55","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1006","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"RUPARAM","VoterName":"रूपाराम","RelayionType":"F","RelationName":"GHISARAM","RelationName2":"घीसाराम","VoterId":"AZB0046227","Sex":"M","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1007","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"SANTUDEVI","VoterName":"सन्तुदेवी","RelayionType":"H","RelationName":"RUPARAM","RelationName2":"रूपाराम","VoterId":"MTW1538198","Sex":"F","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1008","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"RAJUDEVI","VoterName":"राजूदेवी","RelayionType":"H","RelationName":"LAKSHMANARAM","RelationName2":"लक्ष्मणराम","VoterId":"MTW1538214","Sex":"F","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1009","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"LIKHAMA RAM BAVARI","VoterName":"लिखमा राम बावरी","RelayionType":"F","RelationName":"GHISURAM BAVARI","RelationName2":"घीसूराम बावरी","VoterId":"AZB0234955","Sex":"M","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1010","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"VIMALA","VoterName":"विमला","RelayionType":"H","RelationName":"LIKHAMARAM","RelationName2":"लिखमाराम","VoterId":"AZB0279265","Sex":"F","Age":"32","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1011","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"RAJURAM","VoterName":"राजूराम","RelayionType":"F","RelationName":"GHISARAM BAVARI","RelationName2":"घीसाराम बावरी","VoterId":"AZB0265793","Sex":"M","Age":"31","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1012","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"RINA DEVI","VoterName":"रीना देवी","RelayionType":"H","RelationName":"RAJURAM","RelationName2":"राजूराम","VoterId":"AZB0279273","Sex":"F","Age":"30","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1013","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"BANAVARILAL","VoterName":"बनवारीलाल","RelayionType":"F","RelationName":"PRABHURAM","RelationName2":"प्रभुराम","VoterId":"AZB0279281","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1014","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"CHANDA DEVI","VoterName":"चन्दा देवी","RelayionType":"H","RelationName":"BANAVARI LAL","RelationName2":"बनवारी लाल","VoterId":"AZB0279299","Sex":"F","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1015","HouseNoEN":"1069","HouseNo":"1069","VoterNameEn":"BASANTI BAVARI","VoterName":"बसंती बावरी","RelayionType":"H","RelationName":"OMPRAKASH","RelationName2":"ओमप्रकाश","VoterId":"AZB1095348","Sex":"F","Age":"19","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1016","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"CHHOTUDI","VoterName":"छोटूडी","RelayionType":"H","RelationName":"GORADHANARAM","RelationName2":"गोरधनराम","VoterId":"MTW0093444","Sex":"F","Age":"80","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1017","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"DAMODAR","VoterName":"दामोदर","RelayionType":"F","RelationName":"GORADHANARAM","RelationName2":"गोरधनराम","VoterId":"RJ/25/194/093425","Sex":"M","Age":"48","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1018","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"DHAPUDEVI","VoterName":"धापूदेवी","RelayionType":"H","RelationName":"DAMODAR","RelationName2":"दामोदर","VoterId":"RJ/25/194/093146","Sex":"F","Age":"44","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1019","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"MOTIRAM","VoterName":"मोतीराम","RelayionType":"F","RelationName":"GORADHANARAM","RelationName2":"गोरधनराम","VoterId":"RJ/25/194/093614","Sex":"M","Age":"42","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1020","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"JABID KHAN","VoterName":"जाबिद खान","RelayionType":"F","RelationName":"HANIF KHAN","RelationName2":"हनीफ खान","VoterId":"AZB0788273","Sex":"M","Age":"22","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1021","HouseNoEN":"1070","HouseNo":"1070","VoterNameEn":"MUNNI DEVI","VoterName":"मुन्नी देवी","RelayionType":"H","RelationName":"MOTI RAM","RelationName2":"मोतीराम","VoterId":"AZB1080191","Sex":"F","Age":"27","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1022","HouseNoEN":"","HouseNo":"1070 क","VoterNameEn":"BABALI","VoterName":"बबली .","RelayionType":"F","RelationName":"BHAIRURAM","RelationName2":"भैरूराम .","VoterId":"AZB0740019","Sex":"M","Age":"23","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1023","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"KHATUN","VoterName":"खातून","RelayionType":"F","RelationName":"NUR MOHAMMAD","RelationName2":"नूर मोहम्मद","VoterId":"AZB0310052","Sex":"F","Age":"74","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1024","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"MOHAMMAD HANIF","VoterName":"मोहम्मद हनीफ","RelayionType":"F","RelationName":"NUR MOHAMMAD","RelationName2":"नूर मोहम्मद","VoterId":"AZB0310466","Sex":"M","Age":"53","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1025","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"SHOKAT ALI","VoterName":"शोकत अली","RelayionType":"F","RelationName":"NUR MOHAMMAD","RelationName2":"नूर मोहम्मद","VoterId":"AZB0310029","Sex":"M","Age":"49","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1026","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"NAJAMA","VoterName":"नजमा","RelayionType":"H","RelationName":"SHOKAT ALI","RelationName2":"शोकत अली","VoterId":"AZB0310060","Sex":"F","Age":"46","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1027","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"MOHAMMAD HUSAIN","VoterName":"मोहम्मद हुसैन","RelayionType":"F","RelationName":"NUR MOHAMMAD","RelationName2":"नूर मोहम्मद","VoterId":"AZB0310250","Sex":"M","Age":"45","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1028","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"SAKILA BANU","VoterName":"सकीला बानू","RelayionType":"H","RelationName":"MOHAMMAD HUSAIN","RelationName2":"मोहम्मद हुसैन","VoterId":"AZB0310078","Sex":"F","Age":"38","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1029","HouseNoEN":"1070K","HouseNo":"1070क","VoterNameEn":"FIROJ KHAN","VoterName":"फिरोज खान","RelayionType":"F","RelationName":"HANIF KHAN","RelationName2":"हनीफ खान","VoterId":"AZB0234989","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1030","HouseNoEN":"1070K","HouseNo":"1070क","VoterNameEn":"IMARAN KHAN LUHAR","VoterName":"इमरान खान लुहार","RelayionType":"F","RelationName":"SHAUKAT ALI","RelationName2":"शौकत अली","VoterId":"AZB0235002","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1031","HouseNoEN":"1070K","HouseNo":"1070क","VoterNameEn":"ASIF KHAN LUHAR","VoterName":"आसीफ खान लुहार","RelayionType":"F","RelationName":"NUR MOHAMMAD","RelationName2":"नूर मोहम्मद","VoterId":"AZB0235010","Sex":"M","Age":"29","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1032","HouseNoEN":"1070K","HouseNo":"1070क","VoterNameEn":"SADDAM HUSAIN","VoterName":"सद्दाम हुसैन","RelayionType":"F","RelationName":"SHAUKAL ALI","RelationName2":"शौकल अली","VoterId":"AZB0421578","Sex":"M","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1033","HouseNoEN":"1070?","HouseNo":"1070क","VoterNameEn":"RUKSAR BANO","VoterName":"रूक्सार बानो","RelayionType":"H","RelationName":"FIROJ KHAN","RelationName2":"फिरोज खान","VoterId":"AZB0788281","Sex":"F","Age":"24","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1034","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"JAYDA BANO","VoterName":"जायदा बानो","RelayionType":"H","RelationName":"IMRAN KHAN","RelationName2":"इमरान खान","VoterId":"AZB1095298","Sex":"F","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1035","HouseNoEN":"1070 K","HouseNo":"1070 क","VoterNameEn":"SHAHRUKH KHAN","VoterName":"शाहरुख खान","RelayionType":"F","RelationName":"SHOKAT ALI","RelationName2":"शौकत अली","VoterId":"AZB1094630","Sex":"M","Age":"23","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1036","HouseNoEN":"1071","HouseNo":"1071","VoterNameEn":"TARACHAND","VoterName":"ताराचन्द","RelayionType":"F","RelationName":"JAGURAM","RelationName2":"जगूराम","VoterId":"MTW3503216","Sex":"M","Age":"80","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1037","HouseNoEN":"1071","HouseNo":"1071","VoterNameEn":"RAJURAM","VoterName":"राजूराम","RelayionType":"F","RelationName":"TARACHAND","RelationName2":"ताराचन्द","VoterId":"MTW1193416","Sex":"M","Age":"39","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1038","HouseNoEN":"1071","HouseNo":"1071","VoterNameEn":"CHANDADEVI","VoterName":"चन्दादेवी","RelayionType":"H","RelationName":"RAJURAM","RelationName2":"राजूराम","VoterId":"MTW1193424","Sex":"F","Age":"37","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1039","HouseNoEN":"1071","HouseNo":"1071","VoterNameEn":"BANAVARI","VoterName":"बनवारी","RelayionType":"F","RelationName":"TARACHAND","RelationName2":"ताराचन्द","VoterId":"MTW1490853","Sex":"M","Age":"36","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1040","HouseNoEN":"1071K","HouseNo":"1071क","VoterNameEn":"NORATAMAL","VoterName":"नोरतमल","RelayionType":"F","RelationName":"LALURAM","RelationName2":"लालूराम","VoterId":"AZB1012129","Sex":"M","Age":"53","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1041","HouseNoEN":"1071K","HouseNo":"1071क","VoterNameEn":"CHHOTUDI","VoterName":"छोटूड़ी","RelayionType":"H","RelationName":"MADAN LAL","RelationName2":"मदन लाल","VoterId":"MTW3504651","Sex":"F","Age":"47","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1042","HouseNoEN":"1072","HouseNo":"1072","VoterNameEn":"NARABADA","VoterName":"नरबदा","RelayionType":"H","RelationName":"INDRARAM","RelationName2":"इन्द्राराम","VoterId":"RJ/25/194/093604","Sex":"F","Age":"46","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1043","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"SAYARI","VoterName":"सायरी","RelayionType":"H","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"RJ/25/194/093411","Sex":"F","Age":"72","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1044","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"HARAJIRAM","VoterName":"हरजीराम","RelayionType":"F","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"RJ/25/194/093436","Sex":"M","Age":"54","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1045","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"CHHOTURAM","VoterName":"छोटूराम","RelayionType":"F","RelationName":"NATHURAM","RelationName2":"नाथूराम","VoterId":"MTW3504750","Sex":"M","Age":"53","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1046","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"SITA RAM","VoterName":"सीता राम","RelayionType":"F","RelationName":"HARAJI RAM","RelationName2":"हरजी राम","VoterId":"AZB0654517","Sex":"M","Age":"28","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1047","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"PAP","VoterName":"पप्‍पू राम","RelayionType":"F","RelationName":"HARAJI RAM","RelationName2":"हरजी राम","VoterId":"AZB0654525","Sex":"M","Age":"26","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1048","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"NENI DEVI","VoterName":"नेनी देवी","RelayionType":"H","RelationName":"PAPURAM","RelationName2":"पपूराम","VoterId":"AZB0654509","Sex":"F","Age":"25","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1049","HouseNoEN":"1073","HouseNo":"1073","VoterNameEn":"SHAITAN RAM","VoterName":"शैतान राम","RelayionType":"F","RelationName":"HARAJI RAM","RelationName2":"हरजी राम","VoterId":"AZB0654533","Sex":"M","Age":"24","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1050","HouseNoEN":"","HouseNo":"1073","VoterNameEn":"RAMUDI DEVI","VoterName":"रामुड़ी देवी .","RelayionType":"H","RelationName":"HARAJIRAM","RelationName2":"हरजीराम .","VoterId":"AZB0739052","Sex":"F","Age":"50","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"राजकीय उच्‍च प्राथमिक विद्यालय  खाटूखुर्द   दायां भाग़","AcNo":"107","PartNo":"104","SectionNo":"7","SlNo":"1051","HouseNoEN":"","HouseNo":"1073","VoterNameEn":"MUKESH BHATI","VoterName":"मुकेश भाटी .","RelayionType":"H","RelationName":"HARIRAM BHATI","RelationName2":"हरिराम भाटी .","VoterId":"AZB0739250","Sex":"F","Age":"50","contactno":"","AcNameEn":"Deedwana","PartNameEn":"Nagaur","SectionNameEn":"BAVARIYON KA BAS,KHATUKHURD","PollingAddressEn":"GOVT UPPER PRIMARY SCHOOL   KHATU KURD  RIGHT PART","AcName":"डीडवाना","PartName":"नागौर","SectionName":"बावरियों का बास,खाटूखुर्द"},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""},{"PollingAddress":"","AcNo":"","PartNo":"","SectionNo":"","SlNo":"","HouseNoEN":"","HouseNo":"","VoterNameEn":"","VoterName":"","RelayionType":"","RelationName":"","RelationName2":"","VoterId":"","Sex":"","Age":"","contactno":"","AcNameEn":"","PartNameEn":"","SectionNameEn":"","PollingAddressEn":"","AcName":"","PartName":"","SectionName":""}]

    var exceltojson = xlsxtojson;
    try {
        const request = http.get(req.body.fileUrl, function(response) {
            response.pipe(file);
            setTimeout(()=>{
                exceltojson({
                    input: fileName,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:false
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    const csvData = result
                    if(isDefined(csvData[0].AcNameEn) && isDefined(csvData[0].PollingAddressEn) && isDefined(csvData[0].Age) && isDefined(csvData[0].SectionNameEn) &&
                        isDefined(csvData[0].PartNameEn) && isDefined(csvData[0].RelationName)  && isDefined(csvData[0].RelayionType) && isDefined(csvData[0].Sex)
                        && isDefined(csvData[0].SectionNo) && isDefined(csvData[0].VoterId) && isDefined(csvData[0].VoterNameEn) && isDefined(csvData[0].VoterName)
                    ){
                        setTimeout(()=>{
                            fs.unlink(fileName, (err) => {
                                if (err) {
                                    console.error(err)
                                }
                            })
                            return res.status(200).send({data:"data Added Scussfully"});
                        },50000)
                        insertBulkDataInDb(csvData).then( (isAllInserted)=>{
                            if(isAllInserted){
                                insertBulkDataInDb(csvData).then((res1)=>{
                                    fs.unlink(fileName, (err) => {
                                        if (err) {
                                            console.error(err)
                                        }
                                    })

                                    return res.status(200).send({data:"data Added Scussfully"});
                                })
                            } else{
                                fs.unlink(fileName, (err) => {
                                    if (err) {
                                        console.error(err)
                                    }
                                })
                                return res.status(201).send({data:"not able to add data"});
                            }
                        }).catch((err)=>{
                            fs.unlink(fileName, (err) => {
                                if (err) {
                                    console.error(err)
                                }
                            })
                            return res.status(201).send({data:"not able to add data"});
                        })
                    } else {
                        console.log("called")
                        fs.unlink(fileName, (err) => {
                            if (err) {
                                console.error(err)
                            }
                        })
                        res.status(201).send({data:"invalid Excel File!"})
                    }
                });
            },1000)
        });

    }catch (e) {
        console.log(e)
        fs.unlink(fileName, (err) => {
            if (err) {
                console.error(err)
            }
        })
        res.status(201).send({data:"invalid Excel File!"})
    }



    // var obj = xlsx.parse("EXCEL" + '/EXCEL_1617119232601.xlsx');
    // var obj = xlsx.parse(fs.readFileSync("EXCEL" + '/EXCEL_1617119232601.xlsx'));
    // let csvData = [];
    // csvData.push(obj[0].data[0])
    //
    // if(isDefined(csvData[0].AcNameEn) && isDefined(csvData[0].PollingAddressEn) && isDefined(csvData[0].Age) && isDefined(csvData[0].SectionNameEn) &&
    //     isDefined(csvData[0].PartNameEn) && isDefined(csvData[0].RelationName)  && isDefined(csvData[0].RelayionType) && isDefined(csvData[0].Sex)
    //     && isDefined(csvData[0].SectionNo) && isDefined(csvData[0].VoterId) && isDefined(csvData[0].VoterNameEn) && isDefined(csvData[0].VoterName)
    // ){
    //     res.send(csvData)
    // } else {
    //     res.status(201).send({data:"Invalid Excel File!"})
    // }



    // const request = http.get("https://firebasestorage.googleapis.com/v0/b/votingappproject-7cf3e.appspot.com/o/ExcelList%2F_pdf1617118565150.xlsx?alt=media&token=c2c14ecf-b26f-4bf9-a62b-947ef81e639f", function(response) {
    //     response.pipe(file);
    //
    // });
    // try{
    //     const request = await http.get("https://firebasestorage.googleapis.com/v0/b/votingappproject-7cf3e.appspot.com/o/ExcelList%2F_pdf1617118565150.xlsx?alt=media&token=c2c14ecf-b26f-4bf9-a62b-947ef81e639f", async function(response) {
    //         response.pipe(file).on("close",async ()=>{
    //             const storeAsImage = fromPath(fileName, options);
    //             const pageToConvertAsImage = 1;
    //             await storeAsImage(pageToConvertAsImage).then((res) => {
    //                 if(res){
    //                     uploadImageOnFirebase("Images/"+imgName+".1.jpg").then((url)=>{
    //                         if(url){
    //                             console.log("url--",url)
    //                             resolve(url[0])
    //                         } else {
    //                             console.log("called")
    //                             resolve(false)
    //                         }
    //                     })
    //                 } else {
    //                     console.log("called this")
    //                     resolve(false)
    //                 }
    //             }).catch((err)=>{
    //                 console.log("err-",err)
    //                 resolve(false)
    //             });
    //         });
    //     });
    // }  catch (e) {
    //     resolve(false)
    // }


    // insertBulkDataInDb(req.body.csvData).then( (isAllInserted)=>{
    //     if(isAllInserted){
    //         insertBulkDataInDb(req.body.csvData).then((res1)=>{
    //             insertBulkDataInDb(req.body.csvData).then((res2)=>{
    //                 return res.status(200).send({data:"data Added Scussfully"});
    //             })
    //         })
    //     } else{
    //         return res.status(201).send({data:"not able to add data"});
    //     }
    // }).catch((err)=>{
    //     return res.status(201).send({data:"not able to add data"});
    // })

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

router.get("/getElectionList", async (req, res) => {
    getAllElectionList().then((data)=>{
        if(data){
            return res.status(200).send({data:data});
        } else {
            return res.status(201).send({data:"No Election found"});
        }
    }).catch((err)=>{
        return res.status(201).send({data:"No Election found"});
    })
});

router.post("/getVolunteerElection", async (req,res,next)=>{
    if(!isDefined(req.body.volunteerId)){
        return res.status(201).send({data:"Please provide volunteer"})
    }
    else if(!isDefined(req.body.electionId)){
        return res.status(201).send({data:"Please provide volunteer"})
    }
    next();
},async (req, res) => {
    let volunteerElection = [];
    let volunteerNotElection = [];
    await getVolunteerElection(req.body.volunteerId,req.body.electionId).then((data)=>{
        if(data){
            volunteerElection = data;
        }
    }).catch((err)=>{
    })
    await getElectionWithoutVolunteer(req.body.volunteerId,req.body.electionId).then((data)=>{
        if(data){
            volunteerNotElection = data;
        }
    })
    return res.status(200).send({
        data:{volunteerElection:volunteerElection,volunteerNotElection:volunteerNotElection}
    })
});
router.get("/getVolunteerElectionUsingToken", async (req,res,next)=>{
    next();
},async (req, res) => {
    let tokenData = null;
    await decodeDataFromAccessToken(req.headers.token).then((res) => {
        if (res) {
            tokenData = res;
        }
    });
    console.log("toke",tokenData)
    if(tokenData === null){
        return res.status(201).send({
            data:"data not found"
        })
    }

    await getVolunteerElection(tokenData.voterId).then((data)=>{
        if(data){
            console.log("called")
            return res.status(200).send({
                data:data
            })
        } else {
            return res.status(201).send({
                data:"data not found"
            })
        }
    }).catch((err)=>{
        return res.status(201).send({
            data:"data not found"
        })
    })
});

router.post("/getVolunteerElectionBoothToken", async (req,res,next)=>{
    if(!isDefined(req.body.electionId)){
        return res.status(201).send({data:"Please provide election details"})
    }
    next();
},async (req, res) => {
    let tokenData = null;
    await decodeDataFromAccessToken(req.headers.token).then((res) => {
        if (res) {
            tokenData = res;
        }
    });

    if(tokenData === null){
        return res.status(201).send({
            data:"data not found"
        })
    }

    getUserRole(tokenData.voterId).then(async (userRole)=>{
        if(userRole === "ADMIN"){
            getAllBooths().then((boothList)=>{
                if(boothList){
                    return res.status(200).send({
                        data:boothList
                    })
                }
            })
        } else {
            await getVolunteerElection(tokenData.voterId,req.body.electionId).then((data)=>{
                if(data){
                    return res.status(200).send({
                        data:data
                    })
                } else {
                    return res.status(201).send({
                        data:"data not found"
                    })
                }
            }).catch((err)=>{
                return res.status(201).send({
                    data:"data not found"
                })
            })
        }
    })

});

router.post(
    "/updateVolunteerElectionStatus/",
    (req, res, next) => {
        req = req.body
        if (!isDefined(req.volunteerId)) {
            return res.status(201).send({ data: "please provide volunteer" });
        }
        else if (!isDefined(req.electionId)) {
            return res.status(201).send({ data: "please provide election" });
        }
        next();
    },
    async (req, res) => {
        req = req.body
        updateVolunteerElectionStatus(req).then((isUpdated)=>{
            if(isUpdated){
                return res.status(200).send({ data: "Updated.." });
            } else {
                return res.status(201).send({ data: "fail to update..." });
            }
        }).catch((err)=>{
            return res.status(201).send({ data: "fail to update..." });
        })
    }
);

router.post("/getVoterForElection", async (req,res,next)=>{
    if(!isDefined(req.body.electionId)){
        return res.status(201).send({data:"Please provide Election Details"})
    }
    next();
},async (req, res) => {
    let voterWhoDoesVote = [];
    let voterWhoDoesNotVote = [];
    await getVoterWhoDoesVote(req.body.electionId,req.body.boothId).then((data)=>{
        if(data){
            voterWhoDoesVote = data;
        }
    }).catch((err)=>{
    })
    await getVoterWhoDoesNotVote(req.body.electionId,req.body.boothId).then((data)=>{
        if(data){
            voterWhoDoesNotVote = data;
        }
    })
    return res.status(200).send({
        data:{voterWhoDoesVote:voterWhoDoesVote,voterWhoDoesNotVote:voterWhoDoesNotVote}
    })
});

router.post("/updateVoterElectionStatus", async (req,res,next)=>{
    if(!isDefined(req.body.electionId)){
        return res.status(201).send({data:"Please provide Election Details"})
    }
    else if(!isDefined(req.body.voterId)){
        return res.status(201).send({data:"Please provide Voter Details"})
    }
    next();
},async (req, res) => {
    updateVoterElectionStatus(req.body).then((isUpdated)=>{
        if(isUpdated){
            return res.status(200).send({data:"Updated..."})
        } else {
            return res.status(201).send({data:"Fail to Updated..."})
        }
    }).catch((err)=>{
        return res.status(201).send({data:"Fail to Updated..."})
    })
});

router.get("/getAllBoothList", async (req,res,next)=>{
    next();
},async (req, res) => {
    getAllBooths().then((boothList)=>{
        if(boothList){
            return res.status(200).send({data:boothList})
        } else {
            return res.status(201).send({data:"booth not found"})
        }
    }).catch((err)=>{
        return res.status(201).send({data:"booth not found"})
    })
});

router.post("/insertNewBooth", async (req,res,next)=>{
    next();
},async (req, res) => {
    insertNewBooth(req.body).then((isAdded)=>{
        if(isAdded){insertNewBooth
            return res.status(200).send({data:isAdded})
        } else {
            return res.status(201).send({data:"fail to add"})
        }
    }).catch((err)=>{
        return res.status(201).send({data:"fail to add"})
    })
});
router.get("/getAllInfluneceMembers", async (req, res) => {
    let tokenData = null;
    await decodeDataFromAccessToken(req.headers.token).then((res) => {
        tokenData = res;
    });
    if(tokenData === null){
        return res.status(201).send({data:"no data found"});
    } else {
        getAllInclunecerMembers(tokenData.voterId).then((data)=>{
            if(data){
                return res.status(200).send({data:data});
            } else {
                return res.status(201).send({data:"no data found"});
            }
        }).catch((err)=>{
            return res.status(201).send({data:"no data found"});
        })
    }

});


module.exports = router;
