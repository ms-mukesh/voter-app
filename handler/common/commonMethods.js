const db = require("../../models");
const {VOLUNTEER,NORMAL,ADMIN} = require("../common/constants")
const {wardMaster,occupationMaster,trustFactorMaster,voterMaster,familyMaster,castMaster,nativePlaceMaster,addressMaster,adminMaster,notificationTypeMaster,notificationDetails} = db
const { Op } = db.Sequelize;
const loadash = require("lodash");
const getSuffixIndexFromDate = (date) => {
    let tempIndex = -1;
    if (date.includes("th")) {
        tempIndex = date.indexOf("th");
    } else if (date.includes("st")) {
        tempIndex = date.indexOf("st");
    } else if (date.includes("rd")) {
        tempIndex = date.indexOf("rd");
    } else if (date.includes("nd")) {
        tempIndex = date.indexOf("nd");
    }
    return tempIndex;
};
function getMonthFromString(mon) {
    let dateFlag = 0;
    let tempCharDate = [];
    mon = mon.trim();
    if (mon.indexOf("-") < 0) {
        if (mon.indexOf(" ") > 0) {
            if (mon.length >= 3) {
                tempCharDate = Array.from(mon);
                for (let i = 0; i < tempCharDate.length; i++) {
                    if (tempCharDate[i] === " ") {
                        tempCharDate[i] = "-";
                    }
                }
                mon = tempCharDate.join("");
                const tempIndex = getSuffixIndexFromDate(mon);
                if (tempIndex > -1) {
                    const temDt1 = mon.substring(0, tempIndex);
                    const temDt2 = mon.substring(tempIndex + 2, mon.length);
                    mon = temDt1 + temDt2;
                }

                if (mon.split("-").length > 2) {
                    return "not found";
                }
                if (mon.split("-").length === 1) {
                    mon += "1,2012";
                } else if (mon.split("-").length === 2) {
                    if (mon.search(/\d+/g) >= 0) {
                        mon += ",2012";
                    } else {
                        return "not found";
                    }
                } else {
                    mon += "2012";
                }
            }
        } else {
            // mon = mon + "1,2012"
            // eslint-disable-next-line no-lonely-if
            if (mon.search(/^[a-zA-Z]+$/i) > -1) {
                mon += "1,2012";
            } else if (mon.search(/^[0-9]+$/i) > -1) {
                mon += "1,2012";
            } else {
                return "not found";
            }
        }
    } else if (mon.substring(mon.indexOf("-") + 1) === "") {
        if (mon.lastIndexOf("-") + 1 === mon.length) {
            mon = mon.substring(0, mon.length - 1);
            mon += ",2012";
        } else {
            mon = `${mon}1,2012`;
        }
        dateFlag = 1;
    } else if (mon.length >= 3) {
        tempCharDate = Array.from(mon);
        for (let i = 0; i < tempCharDate.length; i++) {
            if (tempCharDate[i] === " ") {
                tempCharDate[i] = "-";
            }
        }
        mon = tempCharDate.join("");
        const tempIndex = getSuffixIndexFromDate(mon);
        if (tempIndex > -1) {
            const temDt1 = mon.substring(0, tempIndex);
            const temDt2 = mon.substring(tempIndex + 2, mon.length);
            mon = temDt1 + temDt2;
        }
        if (mon.split("-").length > 2) {
            return "not found";
        }
        mon += ",2012";
    }
    mon = mon.trim();
    const d = Date.parse(mon);

    let date = "";
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(d)) {
        let month = (new Date(d).getMonth() + 1).toString();
        if (month.length === 1) {
            month = `0${month}`;
        }
        let day = new Date(d).getDate().toString();
        if (day.length === 1) {
            day = `0${day}`;
        }
        if (mon.indexOf("-") < 0) {
            date = `%____${month}__%`;
        } else if (dateFlag === 1) {
            // eslint-disable-next-line no-useless-concat
            date = `%____${month}-` + `__%`;
        } else {
            date = `${"%____" + "-"}${month}-${day}%`;
        }

        return date;
    }
    return "not found";
}
const getAllMarriedMan =()=>{
    return new Promise((resolve)=>{
        let condition = {
            Gender: { [Op.like]: 'male' },
            MaritalStatus: { [Op.ne]: 'married' },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId","FirstName","MiddleName","LastName"],
                where: condition,
            }).then(async (res)=>{
            if(res && res.length>0){
                let tempArray =[];
               await res.map((item)=>{
                    tempArray.push(item.dataValues)
                })
                resolve(tempArray)
            } else{
                resolve(false)
            }
        }).catch(()=>{
            resolve(false)
        })


    })
}
const getDataFromTable = (tableName, attributeList, whereCondition) => {
    let tempRes = [];
    return new Promise(async (resolve) => {
        if (attributeList.length === 0) {
            tempRes = await tableName.findAll({ where: whereCondition });
        } else {
            tempRes = await tableName.findAll({
                where: whereCondition,
                attributes: attributeList,
            });
        }
        return resolve(tempRes);
    });
};

const fetchAllNativePlace = () => {
    return new Promise(async (resolve) => {
        const attributeList = ["Name"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(nativePlaceMaster, attributeList, "").then(
            async (res) => {
                if (!res) {
                    return resolve(false);
                }
                await res.map((data) => {
                    tempData = data.dataValues;
                    tempDataArray.push(tempData.Name);
                });
                const obj = {
                    NativePlace: tempDataArray,
                };
                resolve(obj);
            }
        );
    });
};
const fetchAllBoothName = () =>{
    return new Promise(async (resolve) => {
        const attributeList = ["WardName"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(wardMaster, attributeList, "").then(
            async (res) => {
                if (!res) {
                    return resolve(false);
                }
                await res.map((data) => {
                    tempData = data.dataValues;
                    if(tempData.WardName!==null && tempData.WardName!=='' ){
                        tempDataArray.push(tempData.WardName);
                    }

                });
                const obj = {
                    BoothName: tempDataArray,
                };
                resolve(obj);
            }
        );
    });
}
const fetchAllCastName = () => {
    return new Promise(async (resolve) => {
        const attributeList = ["CastName"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(castMaster, attributeList, "").then(
            async (res) => {
                if (!res) {
                    return resolve(false);
                }
                await res.map((data) => {
                    tempData = data.dataValues;
                    tempDataArray.push(tempData.CastName);
                });
                const obj = {
                    CastName: tempDataArray,
                };
                resolve(obj);
            }
        );
    });
};
const fetchAllTrustFactor = () =>{
    return new Promise(async (resolve) => {
        const attributeList = ["Name"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(trustFactorMaster, attributeList, "").then(
            async (res) => {
                if (!res) {
                    return resolve(false);
                }
                await res.map((data) => {
                    tempData = data.dataValues;
                    tempDataArray.push(tempData.Name);
                });
                const obj = {
                    TrustFactor: tempDataArray,
                };
                resolve(obj);
            }
        );
    });
}

const fetchAllOccupation = () =>{
    return new Promise(async (resolve) => {
        const attributeList = ["Name"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(occupationMaster, attributeList, "").then(
            async (res) => {
                if (!res) {
                    return resolve(false);
                }
                await res.map((data) => {
                    tempData = data.dataValues;
                    tempDataArray.push(tempData.Name);
                });
                const obj = {
                    Occupations: tempDataArray,
                };
                resolve(obj);
            }
        );
    });
}

const getAllMarriedWoman =()=>{
    return new Promise((resolve)=>{
        let condition = {
            Gender: { [Op.like]: 'female' },
            MaritalStatus: { [Op.ne]: 'married' },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId","FirstName","MiddleName","LastName"],
                where: condition,
            }).then(async (res)=>{
            if(res && res.length>0){
                let tempArray =[];
                await res.map((item)=>{
                    tempArray.push(item.dataValues)
                })
                resolve(tempArray)
            } else{
                resolve(false)
            }
        }).catch(()=>{
            resolve(false)
        })

    })
}
const removeDuplicates = (arrayName, key) => {
    const newArray = [];
    const uniqueObject = {};
    let objHead;
    for (const i in arrayName) {
        objHead = arrayName[i][key];
        uniqueObject[objHead] = arrayName[i];
    }
    for (const i in uniqueObject) {
        newArray.push(uniqueObject[i]);
    }
    return newArray;
};
const getAllFamilyWiseDetails = ()=>{
    return new Promise((resolve)=>{
        let condition = {
            Gender: { [Op.like]: 'male' },
            MaritalStatus: { [Op.ne]: 'married' },
        };
            voterMaster.findAll({
                include: [
                    {
                        model: familyMaster,
                    }]

            }).then(async (res)=>{
            if(res && res.length>0){
                let tempArray =[];
                await res.map((item)=>{
                    tempArray.push({"Name":item.dataValues.FirstName+" "+item.dataValues.MiddleName,"FamilyId":item.dataValues.FamilyId})
                })
                 tempArray = await loadash.groupBy(tempArray, "FamilyId");
                // console.log(Object.entries(tempArray))
                resolve(Object.entries(tempArray))
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(false)
        })


    })
}
const getAllCast = ()=>{
    return new Promise((resolve)=>{
        castMaster.findAll().then(async (res)=>{
            if(res && res.length>0){
                let tempArray =[];
                await res.map((item)=>{
                    tempArray.push(item.dataValues.CastName)
                })

                resolve(tempArray)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(false)
        })
    })
}
const isDefined = (value) => {
    if (typeof value !== "undefined") {
        return true;
    }
    return false;
};
const getAllNativePlace = ()=>{
    return new Promise((resolve)=>{
        nativePlaceMaster.findAll().then(async (res)=>{
            if(res && res.length>0){
                let tempArray =[];
                await res.map((item)=>{
                    tempArray.push(item.dataValues.Name)
                })
                resolve(tempArray)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(false)
        })
    })
}
const getCastIdFromCastName=(castName)=>{
    return new Promise((resolve)=>{
        let condition = {
            CastName: { [Op.like]: castName },

        };
        castMaster.findOne({where:condition,attributes:["CastId"]}).then((res)=>{
            if(res){
                resolve(res.dataValues.CastId)
            } else{
                resolve(1)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(1)
        })
    })

}
const getNativePlaceIdFromCastName=(nativePlaceName)=>{
    return new Promise((resolve)=>{
        let condition = {
            Name: { [Op.like]: nativePlaceName },
        };
        nativePlaceMaster.findOne({where:condition,attributes:["NativePlaceId"]}).then((res)=>{
            if(res){
                resolve(res.dataValues.NativePlaceId)
            } else{
                resolve(1)
            }
        }).catch((err)=>{
            console.log(err)
            resolve(1)
        })
    })

}
const fetchAllRegion = () => {
    return new Promise(async (resolve) => {
        const attributeList = ["CityOrVillageName", "DistrictName", "StateName","CountryName"];
        let tempData = "";
        const tempDataArray = [];
        await getDataFromTable(addressMaster, attributeList, "").then(async (res) => {
            if (res) {
                await res.map((data) => {
                    tempData = data.dataValues;
                    tempDataArray.push({
                        ...tempData,
                    });
                });
                const states = [];
                const country = [];
                const cities = [];
                const district = [];
                console.log(tempDataArray)

                tempDataArray.map((regionData) => {
                    regionData.StateName !== "-" &&
                    regionData.StateName !== "" &&
                    regionData.StateName !== null &&
                    states.push(regionData.StateName);
                    regionData.CountryName !== "-" &&
                    regionData.CountryName !== "" &&
                    regionData.CountryName !== null &&
                    country.push(regionData.CountryName);
                    regionData.CityOrVillageName !== "-" &&
                    regionData.CityOrVillageName !== "" &&
                    regionData.CityOrVillageName !== null &&
                    cities.push(regionData.CityOrVillageName);
                    regionData.DistrictName !== "-" &&
                    regionData.DistrictName !== "" &&
                    regionData.DistrictName !== null &&
                    district.push(regionData.DistrictName);

                });
                const obj = {
                    States: uniq(states),
                    City: uniq(cities),
                    Countries: uniq(country),
                    District: uniq(district),
                };
                resolve(obj);
            } else {
                resolve(false);
            }
        });
    });
};
const getAdminMemberId = () => {
    return new Promise((resolve) => {
        adminMaster
            .findAll({
                attributes: ["AdminId"],
                include: [
                    {
                        attributes: ["VoterId"],
                        model: voterMaster,
                    },
                ],
            })
            .then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};


const getAllMemberId = () => {
    return new Promise((resolve) => {
        voterMaster
            .findAll({
                attributes: ["VoterId"],
            })
            .then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};
const getAllMaleMemberId = () => {
    return new Promise((resolve) => {
        let condition = {
            Gender: { [Op.like]: 'male' },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId"],
                where:condition
            })
            .then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};
const getAllFemaleMemberId = () => {
    return new Promise((resolve) => {
        let condition = {
            Gender: { [Op.like]: 'female' },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId"],
                where:condition
            })
            .then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};
const getAllVolunteerMemberId = () => {
    return new Promise((resolve) => {
        let condition = {
            IsOurVolunteer: { [Op.eq]: 1 },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId"],
                where:condition
            })
            .then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};

const getAllHeadMemberId = () => {
    return new Promise(async (resolve) => {
        await voterMaster
            .findAll({
                attributes: ["VoterId"],
                include: [
                    {
                        attributes: ["HeadId"],
                        model: familyMaster,
                    },
                ],
            })
            .then(async (res) => {
                // console.log(res)
                let headId = [];

                await res.map((data) => {
                    headId.push(data.dataValues.FamilyMaster.dataValues);
                });
                headId = removeDuplicates(headId, "HeadId");
                resolve(headId);
            });
    });
};
const getTypeIdFromName = (typeName) => {
    return new Promise(async (resolve) => {
        const condition = {
            TypeName: { [Op.eq]: `${typeName}` },
        };
        const typeId = await notificationTypeMaster.findOne({ where: condition });
        if (typeId) {
            return resolve(typeId.dataValues.NotificationTypeId);
        }
        return resolve(1);
    });
};
function uniq(a) {
    return a.sort().filter(function (item, pos, ary) {
        return !pos || item !== ary[pos - 1];
    });
}
const checkForValue = (value) => {
    if (value && isDefined(value) && value !== null) {
        return value;
    }
    return "-";
};

const checkForValueForUpdate = (value) => {
    if (value && isDefined(value) && value !== null && value!=="" && value!=="-") {
        return value;
    }
    return null;
};
const getAllVolunteer = () => {
    return new Promise((resolve) => {
        let condition = {
            IsOurVolunteer: { [Op.like]: '1' },
        };
        voterMaster
            .findAll({
                attributes: ["VoterId","FirstName","LastName","Email","Mobile","MiddleName","VoterVotingId","Age","ProfileImage"],
                where:condition
            })
            .then((res) => {
                console.log(res)
                if (res) {
                    resolve(res);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                resolve(false);
            });
    });
};
const getUserRole = (memberId) =>{
    return new Promise(async (resolve) => {
        let role = NORMAL;
        const conditionForTable = {
            VoterId: { [Op.eq]: `${memberId}` },
        };
        let members = await adminMaster.findAll({
            where: conditionForTable,
            attributes: ["VoterId"],
            include: [
                {
                    attributes: ["VoterId"],
                    model: voterMaster,
                },
            ],
        });

        if (members.length === 0) {
            members = await voterMaster.findOne({
                where: conditionForTable,
                attributes: ["FirstName","IsOurVolunteer"],
            });
            if (
                parseInt(members.dataValues.IsOurVolunteer) === 1 && members.dataValues.IsOurVolunteer!==null ) {
                role = VOLUNTEER;
                return resolve(role);
            }
            return resolve(role);
        }
        role = ADMIN;
        return resolve(role);
    });
}
const getAllAdminMemberId = () =>{
    let adminIdArray = [];
    return new Promise((resolve)=>{
        adminMaster.findAll().then((data)=>{
            if(data){
                data.map((item)=>{
                    adminIdArray.push(item.dataValues.VoterId)
                })
                resolve(adminIdArray)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}
const getAllVolunteerId = () =>{
    let volunteerIdArray = [];
    let condition = {
        IsOurVolunteer: { [Op.eq]: 1 },
    };
    return new Promise((resolve)=>{
        voterMaster.findAll({where:condition}).then((data)=>{
            if(data){
                data.map((item)=>{
                    volunteerIdArray.push(item.dataValues.VoterId)
                })
                resolve(volunteerIdArray)
            } else{
                resolve(false)
            }
        }).catch((err)=>{
            resolve(false)
        })
    })
}

const getIdFromTable = (tableName, condition) => {
    return new Promise((resolve) => {
        tableName.findAll({ where: condition }).then((res) => {
            return resolve(res);
        });
    });
};

const updateTableValue = (tableName, values, condition) => {
    return new Promise((resolve) => {
        tableName
            .update(values, { where: condition })
            .then((res) => {
                if (res) {
                    return resolve(true);
                }
                return resolve(false);
            })
            .catch((err) => {
                console.log(err);
                return resolve(false);
            });
    });
};
const sort_by_key = (array, key)=>
{
    return array.sort(function(a, b)
    {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function filterComparador(arrSecundario) {
    return (arrAtual) => {
        return arrSecundario.filter((other) => {
            return other.value == arrAtual.value;
        }).length != 0;
    };
}

function mapComparador(arrSecundario) {
    return (arrAtual) => {
        Object.keys(arrAtual).forEach((prop) => {
            if (Array.isArray(arrAtual[prop])) {
                let propValue =  arrAtual[prop].filter(filterComparador(arrSecundario));
                if (propValue.length > 0) {
                    arrAtual[prop] = propValue.map(mapComparador(arrSecundario));
                } else {
                    delete arrAtual[prop];
                }
            }
        });
        return arrAtual;
    };
}


module.exports = {
    mapComparador,
    filterComparador,
    sort_by_key,
    getMonthFromString,
    getAllMarriedMan,
    getAllMarriedWoman,
    getAllFamilyWiseDetails,
    getAllCast,
    getAllNativePlace,
    isDefined,
    getCastIdFromCastName,
    getNativePlaceIdFromCastName,
    getAdminMemberId,
    getAllMemberId,
    getAllHeadMemberId,
    removeDuplicates,
    getTypeIdFromName,
    uniq,
    fetchAllNativePlace,
    fetchAllRegion,
    fetchAllCastName,
    fetchAllTrustFactor,
    getAllVolunteer,
    checkForValue,
    fetchAllOccupation,
    getIdFromTable,
    updateTableValue,
    checkForValueForUpdate,
    fetchAllBoothName,
    getAllVolunteerMemberId,
    getAllFemaleMemberId,
    getAllMaleMemberId,
    getUserRole,
    getAllAdminMemberId,
    getAllVolunteerId
};

