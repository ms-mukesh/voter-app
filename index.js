const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./models");
const {removeToken} = require("./handler/utils")
const {getAllMemberId,getAllHeadMemberId,getAdminMemberId,getNativePlaceIdFromCastName,getCastIdFromCastName,getAllMarriedMan,getAllMarriedWoman,getAllFamilyWiseDetails,getAllCast,getAllNativePlace} = require('./handler/common/commonMethods')
db.sequelize.sync();
const app = express();
const { port } = require("./config/dbConfig");
const userAuthentication = require("./routes/userAuthentication");
const userActions = require("./routes/userActions")
const notification = require("./routes/notificationRoute")
const event = require("./routes/event")
const volunteer = require("./routes/volunteer")
const {getBoothWiseVoterList,getBoothForVolunteer,getBoothDetailRemainingForVolunteer} = require("./handler/volunteer")
const {insertBulkDataInDb} = require("./handler/voterData")

// insertBulkDataInDb("dsd").then((res)=>{})
// getBoothWiseVoterList(1).then((res)=>{
//     console.log(res)
// })
const tempArray=[
    {"name":"mukesh bhargav","middleName":"sanjay","dob":"1997-3-21","gender":"male","voterVotingId":"1","boothId":"W-101","roomNo":"1","address":"a-84,hira nagar","relation":"father"},
    {"name":"sanjay kumar","middleName":"manekchand","dob":"1997-3-21","gender":"male","voterVotingId":"2","boothId":"W-101","roomNo":"1","address":"a-84,hira nagar","relation":"father"},
    {"name":"manekchand","middleName":"mahendra","dob":"1997-3-21","gender":"male","voterVotingId":"3","boothId":"W-101","roomNo":"1","address":"a-84,hira nagar","relation":"father"},
    {"name":"amit sharma","middleName":"mahendra","dob":"1997-3-21","gender":"male","voterVotingId":"3","boothId":"W-101","roomNo":"1","address":"a-85,hira nagar","relation":"father"},
    {"name":"sakhi","middleName":"ramesh","dob":"1997-3-21","gender":"female","voterVotingId":"4","boothId":"W-101","roomNo":"2","address":"a-85,hira nagar","relation":"husband"},
    {"name":"neha","middleName":"varun kumar","dob":"1997-3-21","gender":"female","voterVotingId":"5","boothId":"W-101","roomNo":"2","address":"a-85,hira nagar","relation":"husband"},
    {"name":"suman","middleName":"amit","dob":"1997-3-21","gender":"female","voterVotingId":"6","boothId":"W-101","address":"a-85,hira nagar","roomNo":"1","relation":"husband"},
    {"name":"manju sharma","middleName":"krishna devi","dob":"1997-3-21","gender":"female","voterVotingId":"7","boothId":"W-101","address":"a-86,hira nagar","roomNo":"3","relation":"husband"},
    {"name":"sonal","middleName":"sunil","dob":"1997-3-21","gender":"female","voterVotingId":"8","boothId":"W-101","address":"a-86,hira nagar","roomNo":"3","relation":"father"},
    {"name":"aarti antil","middleName":"ajay","dob":"1997-3-21","gender":"female","voterVotingId":"9","boothId":"W-101","address":"a-86,hira nagar","roomNo":"3","relation":"father"},
    {"name":"juhi verma","middleName":"hari prakash","dob":"1997-3-21","gender":"female","voterVotingId":"10","boothId":"W-101","address":"a-87,hira nagar","roomNo":"4","relation":"father"},
    {"name":"nisha","middleName":"krushna","dob":"1997-3-21","gender":"female","voterVotingId":"11","boothId":"W-101","address":"a-87,hira nagar","roomNo":"4","relation":"father"},
    {"name":"monika","middleName":"ankit","dob":"1997-3-21","gender":"female","voterVotingId":"12","boothId":"W-101","address":"a-87,hira nagar","roomNo":"4","relation":"father"},
    {"name":"dipak","middleName":"ram kishor","dob":"1997-3-21","gender":"male","voterVotingId":"13","boothId":"W-101","address":"a-88,hira nagar","roomNo":"5","relation":"father"}

]

const {covertPdfToImage} = require("./handler/voterData")
// covertPdfToImage(tempArray).then((res)=>{
//     console.log(res)
// })




app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
// getAllHeadMemberId().then((res)=>{
//     console.log(res)
// })


app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/userAuthentication", userAuthentication);
app.use("/userActions", userActions);
app.use("/notification", notification);
app.use("/event", event);
app.use("/volunteer", volunteer);


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
