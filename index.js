const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const tokenChecker = require("./middleware/headerTokenChecker");
db.sequelize.sync();
const app = express();
const userAuthentication = require("./routes/userAuthentication");
const userActions = require("./routes/userActions")
const notification = require("./routes/notificationRoute")
const event = require("./routes/event")
const volunteer = require("./routes/volunteer")
const survey = require("./routes/survey");
const {insertBulkDataInDb,getAddressID,addAllAdress, insertBulkVoterList, getVoterList, getVoterListWhoHasVoted,
  getFilterValuesForVoterList, getFilterValuesForElectionList, getMyProfileDetailsFromVoterList
} = require("./handler/voterData")

let tempArray = [ {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 75, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "CHHOTU RAM ", "RelationName2": "छोटू राम ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 1, "VoterId": "AZB1038934", "VoterName": "बजरंग लाल ", "VoterNameEn": "BAJRANG LAL ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 68, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJRANG LAL ", "RelationName2": "बजरंग लाल ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 2, "VoterId": "AZB1038900", "VoterName": "केशर देवी ", "VoterNameEn": "KESHAR DEVI ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 44, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GUMANA RAM ", "RelationName2": "गुमाना राम  ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 3, "VoterId": "AZB1038868", "VoterName": "भंवरी देवी ", "VoterNameEn": "BHANWARI DEVI ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 42, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NANUKHAN ", "RelationName2": "नानूखां ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 4, "VoterId": "MTW1702711", "VoterName": "विनोददेवी ", "VoterNameEn": "VINODADEVI ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BABUKHAN ", "RelationName2": "बाबूखान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 5, "VoterId": "AZB0311282", "VoterName": "महबुब खान ", "VoterNameEn": "MAHABUB KHAN ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 28, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BABU KHAN ", "RelationName2": "बाबू खाँ ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 6, "VoterId": "MTW1036755", "VoterName": "सायरी देवी ", "VoterNameEn": "SAYARI DEVI ", "contactno": ""},
  {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "PollingAddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MAHBUB KHAN ", "RelationName2": "महबुब खान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 7, "VoterId": "AZB0863241", "VoterName": "तबसुम बानो ", "VoterNameEn": "TABSUM BANO ", "contactno": ""}
]
let tempArray2 =  [["electionId", "boothId", "voterName", "village", "voterCategory", "mandalName", "shaktiKendraName", "phoneNumber", "familyNumber", "dob"], ["v-1011", 1, "ajay", "surat", "red", "NA", "na", 9638774221, 1], ["v-1012", 1, "mukesh", "surat", "green", "na", "na", 7990930475, 1]]

// insertBulkVoterList(tempArray2).then((res)=>{})
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/userAuthentication", userAuthentication);
app.use(tokenChecker);
app.use("/userActions", userActions);
app.use("/notification", notification);
app.use("/event", event);
app.use("/volunteer", volunteer);
app.use("/survey", survey);
// getMyProfileDetailsFromVoterList().then((res)=>{console.log(res)})


app.listen(process.env.PORT || 3000, function(){
    console.log("server listening on port %d in %s mode", this.address().port, app.settings.env);
});
