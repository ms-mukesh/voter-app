const loadash = require("lodash")
const moment = require("moment")
const http = require("https")
const fs = require("fs");

const {
    PAGE_LIMIT,
    monthArray,
    VOTER_ATTRIBUTES,
    DATABASE_NAME,
    VOLUNTEER,
    ADMIN,
    NORMAL
} = require("./common/constants");
const {getAllAdminMemberId,getAllVolunteerId,getUserRole,getMonthFromString,isDefined,checkForValue,checkForValueForUpdate,getIdFromTable,updateTableValue} = require("./common/commonMethods");
const { fromPath } = require("pdf2pic")
const uuid = require("uuid-v4");
const { Storage } = require("@google-cloud/storage");
const {removeDuplicates} = require("../handler/common/commonMethods")
// eslint-disable-next-line import/order
//select * from community_db.VoterMaster where BoothId in(SELECT BoothId FROM community_db.Volunteer_Booth where VolunteerId = 8);

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
    volunteer_election,
    volunteer_booth,
    polling_booth_master,
    vidhanSabhaMaster,
  voter_list_master
} = db;

let lastPage = 0;
let totalMembers = 0;
const tempArray = [{"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 75, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "CHHOTU RAM ", "RelationName2": "छोटू राम ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 1, "VoterId": "AZB1038934", "VoterName": "बजरंग लाल ", "VoterNameEn": "BAJRANG LAL ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 68, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJRANG LAL ", "RelationName2": "बजरंग लाल ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 2, "VoterId": "AZB1038900", "VoterName": "केशर देवी ", "VoterNameEn": "KESHAR DEVI ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 44, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GUMANA RAM ", "RelationName2": "गुमाना राम  ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 3, "VoterId": "AZB1038868", "VoterName": "भंवरी देवी ", "VoterNameEn": "BHANWARI DEVI ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 42, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NANUKHAN ", "RelationName2": "नानूखां ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 4, "VoterId": "MTW1702711", "VoterName": "विनोददेवी ", "VoterNameEn": "VINODADEVI ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BABUKHAN ", "RelationName2": "बाबूखान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 5, "VoterId": "AZB0311282", "VoterName": "महबुब खान ", "VoterNameEn": "MAHABUB KHAN ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 28, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BABU KHAN ", "RelationName2": "बाबू खाँ ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 6, "VoterId": "MTW1036755", "VoterName": "सायरी देवी ", "VoterNameEn": "SAYARI DEVI ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MAHBUB KHAN ", "RelationName2": "महबुब खान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 7, "VoterId": "AZB0863241", "VoterName": "तबसुम बानो ", "VoterNameEn": "TABSUM BANO ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 23, "HouseNo": "2", "HouseNoEN": "2", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BABU KHAN ", "RelationName2": "बाबु खान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 8, "VoterId": "AZB0863233", "VoterName": "असलम खान ", "VoterNameEn": "ASLAM KHAN ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 45, "HouseNo": "02", "HouseNoEN": "02", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BUDHE KHAN ", "RelationName2": "बुधे खान ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 9, "VoterId": "AZB1126184", "VoterName": "नानू खान ", "VoterNameEn": "NANU KHAN ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 29, "HouseNo": "02", "HouseNoEN": "02", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "ASHLAM KHAN ", "RelationName2": "असलम खान ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 10, "VoterId": "AZB1126507", "VoterName": "रहीसा ", "VoterNameEn": "RAHISA ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 65, "HouseNo": "3", "HouseNoEN": "3", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SAVANTASINGH ", "RelationName2": "सावंतसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 11, "VoterId": "RJ/25/194/018301", "VoterName": "बजरंगसिंह ", "VoterNameEn": "BAJARANGASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 33, "HouseNo": "3", "HouseNoEN": "3", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJARANG SINGH ", "RelationName2": "बजरंग सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 12, "VoterId": "AZB0111245", "VoterName": "बलवीर सिंह ", "VoterNameEn": "BALAVIR SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 28, "HouseNo": "3", "HouseNoEN": "3", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BALAVIR SINGH ", "RelationName2": "बलवीर सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 13, "VoterId": "AZB0407759", "VoterName": "मधुबाला ", "VoterNameEn": "MADHUBALA ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 54, "HouseNo": "4", "HouseNoEN": "4", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BHAGIRATHASINGH ", "RelationName2": "भागीरथसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 14, "VoterId": "RJ/25/194/018002", "VoterName": "अन्तरकवर ", "VoterNameEn": "ANTARAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 39, "HouseNo": "4", "HouseNoEN": "4", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BHAGIRATHASINGH ", "RelationName2": "भागीरथसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 15, "VoterId": "MTW1482348", "VoterName": "गोपालसिंह ", "VoterNameEn": "GOPALASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 33, "HouseNo": "4", "HouseNoEN": "4", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GOPALASINGH ", "RelationName2": "गोपालसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 16, "VoterId": "AZB0455113", "VoterName": "प्रदीप कंवर ", "VoterNameEn": "PRADIP KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 28, "HouseNo": "4", "HouseNoEN": "4", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BHAGIRATH SINGH ", "RelationName2": "भागीरथ सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 17, "VoterId": "AZB0277574", "VoterName": "उपेन्द्र सिंह ", "VoterNameEn": "UPENDRA SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 57, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SHIVADANASINGH ", "RelationName2": "शिवदानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 18, "VoterId": "MTW1395888", "VoterName": "केशरसिंह ", "VoterNameEn": "KESHARASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 54, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESHARASINGH ", "RelationName2": "केशरसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 19, "VoterId": "RJ/25/194/018012", "VoterName": "गेनकवर ", "VoterNameEn": "GENAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 31, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESHARASINGH ", "RelationName2": "केशरसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 20, "VoterId": "AZB0261354", "VoterName": "मूलसिंह ", "VoterNameEn": "MULASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 29, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MUL SINGH ", "RelationName2": "मुल सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 21, "VoterId": "AZB0629303", "VoterName": "लक्ष्मी कंवर ", "VoterNameEn": "LAKSHMI KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESHAR SINGH ", "RelationName2": "केशर सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 22, "VoterId": "AZB0312439", "VoterName": "छिगन सिंह ", "VoterNameEn": "CHHIGAN SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 22, "HouseNo": "5", "HouseNoEN": "5", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESR SINGH  ", "RelationName2": "केसर सिंह  ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 23, "VoterId": "AZB0863324", "VoterName": "पारस कँवर  ", "VoterNameEn": "PARS KANVAR  ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 67, "HouseNo": "6", "HouseNoEN": "6", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BHAVARASINGH ", "RelationName2": "भवरसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 24, "VoterId": "RJ/25/194/018036", "VoterName": "मगनकवर ", "VoterNameEn": "MAGANAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 46, "HouseNo": "6", "HouseNoEN": "6", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESHARASINGH ", "RelationName2": "केशरसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 25, "VoterId": "RJ/25/194/018447", "VoterName": "हीरकवर ", "VoterNameEn": "HIRAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 44, "HouseNo": "6", "HouseNoEN": "6", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BHANVARASINGH ", "RelationName2": "भंवरसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 26, "VoterId": "AZB0180927", "VoterName": "मोतीसिंह ", "VoterNameEn": "MOTISINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 39, "HouseNo": "6", "HouseNoEN": "6", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MOTISINGH ", "RelationName2": "मोतीसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 27, "VoterId": "AZB0180919", "VoterName": "सुदेशकंवर ", "VoterNameEn": "SUDESHAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 20, "HouseNo": "6", "HouseNoEN": "6", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KESR SINGH  ", "RelationName2": "केसर सिंह  ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 28, "VoterId": "AZB0863316", "VoterName": "अनिता कँवर  ", "VoterNameEn": "ANITA KANVAR  ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 64, "HouseNo": "7", "HouseNoEN": "7", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SAMANASINGH ", "RelationName2": "समानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 29, "VoterId": "AZB0144337", "VoterName": "हरिसिंह ", "VoterNameEn": "HARISINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 63, "HouseNo": "7", "HouseNoEN": "7", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "HARISINGH ", "RelationName2": "हरिसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 30, "VoterId": "AZB0144345", "VoterName": "गिरघरकवर ", "VoterNameEn": "GIRAGHARAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "7", "HouseNoEN": "", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "HARISINGH RATHAUD ", "RelationName2": "हरिसिंह राठौड .", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 31, "VoterId": "AZB0680355", "VoterName": "योगिराज सिंह राठौड .", "VoterNameEn": "YOGIRAJ SINGH RATHAUD ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 23, "HouseNo": "7", "HouseNoEN": "7", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "HARI SINGH ", "RelationName2": "हरि सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 32, "VoterId": "AZB0863159", "VoterName": "चेतनाराज ", "VoterNameEn": "CHETNARAJ ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 56, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SAMAN SINGH ", "RelationName2": "समान सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 33, "VoterId": "AZB0261362", "VoterName": "विक्रम सिंह ", "VoterNameEn": "VIKRAM SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 52, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SAMANASINGH ", "RelationName2": "समानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 34, "VoterId": "RJ/25/194/018434", "VoterName": "नरेन्द्रसिंह ", "VoterNameEn": "NARENDRASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 51, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "SAMANASINGH ", "RelationName2": "समानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 35, "VoterId": "AZB0112078", "VoterName": "राजेन्द्रसिंह ", "VoterNameEn": "RAJENDRASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 51, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "VIKRAMASINGH ", "RelationName2": "विक्रमसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 36, "VoterId": "MTW1702943", "VoterName": "चांदकंवर ", "VoterNameEn": "CHANDAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 49, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NARENDRASINGH ", "RelationName2": "नरेन्द्रसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 37, "VoterId": "MTW1482355", "VoterName": "विनोदकंवर ", "VoterNameEn": "VINODAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 49, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "RAJEDRANSINGH ", "RelationName2": "राजेद्रंसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 38, "VoterId": "RJ/25/194/018080", "VoterName": "बसुकवर ", "VoterNameEn": "BASUKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 34, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "VIKRAM SINGH ", "RelationName2": "विक्रम सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 39, "VoterId": "AZB0261388", "VoterName": "विनोद सिंह ", "VoterNameEn": "VINOD SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 34, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "VIKRAM SINGH ", "RelationName2": "विक्रम सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 40, "VoterId": "AZB0995845", "VoterName": "भंवर विनोद सिंह जोधा ", "VoterNameEn": "BHANVAR VINOD SINGH JODHA ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 32, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "VIKRAM SINGH ", "RelationName2": "विक्रम सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 41, "VoterId": "AZB0112060", "VoterName": "महेन्द्र सिंह ", "VoterNameEn": "MAHENDRA SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "narendra singh rathore ", "RelationName2": "नरेन्द्र सिंह राठौड़ ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 42, "VoterId": "AZB0112219", "VoterName": "गिरवर सिंह राठौड़ ", "VoterNameEn": "girwar singh rathore ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "RAJENDRA SINGH ", "RelationName2": "राजेन्द्र सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 43, "VoterId": "AZB0507681", "VoterName": "समदर सिंह ", "VoterNameEn": "SAMADAR SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "VIKRAMASINGH ", "RelationName2": "विक्रमसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 44, "VoterId": "AZB0261370", "VoterName": "महीपाल सिंह ", "VoterNameEn": "MAHIPAL SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 30, "HouseNo": "8", "HouseNoEN": "8", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NARPAT SINGH ", "RelationName2": "नरपत सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 45, "VoterId": "AZB0832907", "VoterName": "सुमन कंवर ", "VoterNameEn": "SUMAN KANWAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "08", "HouseNoEN": "08", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NARENDRA SINGH ", "RelationName2": "नरेन्द्र सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 46, "VoterId": "AZB0312405", "VoterName": "मुकेश सिंह ", "VoterNameEn": "MUKESH SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 105, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KANASINGH ", "RelationName2": "कानसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 47, "VoterId": "RJ/25/194/018108", "VoterName": "केशर कंवर ", "VoterNameEn": "KESHAR KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 63, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KANASINGH ", "RelationName2": "कानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 48, "VoterId": "MTW1702240", "VoterName": "मदनसिंह ", "VoterNameEn": "MADANASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 59, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MADANASINGH ", "RelationName2": "मदनसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 49, "VoterId": "RJ/25/194/018098", "VoterName": "रुकमीणी कँवर ", "VoterNameEn": "RUKMINI KANWAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 52, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "DEVI SINGH ", "RelationName2": "देवी सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 50, "VoterId": "RJ/25/194/018449", "VoterName": "सन्तोषकवर ", "VoterNameEn": "SANTOSHAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 49, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KANASINGH ", "RelationName2": "कानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 51, "VoterId": "MTW3514866", "VoterName": "देवी सिंह ", "VoterNameEn": "DEVI SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 42, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MADANASINGH ", "RelationName2": "मदनसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 52, "VoterId": "MTW1395896", "VoterName": "रामावतारसिंह ", "VoterNameEn": "RAMAVATARASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 39, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MADANASINGH ", "RelationName2": "मदनसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 53, "VoterId": "MTW1038504", "VoterName": "अर्जुनसिंह ", "VoterNameEn": "ARJUNASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 33, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "RAMAVATARASINGH ", "RelationName2": "रामावतारसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 54, "VoterId": "MTW1702307", "VoterName": "विनोदकंवर ", "VoterNameEn": "VINODAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 32, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "ARJUN SINGH ", "RelationName2": "अर्जुन सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 55, "VoterId": "AZB0111864", "VoterName": "विद्युत कंवर ", "VoterNameEn": "VIDHYUT KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 26, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "DEVISINGH ", "RelationName2": "देवीसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 56, "VoterId": "AZB0454959", "VoterName": "किशोरसिंह ", "VoterNameEn": "KISHORASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 21, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "DEVI SINGH ", "RelationName2": "देवी सिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 57, "VoterId": "AZB1069855", "VoterName": "अशोक कुमार ", "VoterNameEn": "ASHOK KUMAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 25, "HouseNo": "9", "HouseNoEN": "9", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KISHOR SINGH ", "RelationName2": "किशोर सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 58, "VoterId": "AZB1119841", "VoterName": "संतोष कंवर ", "VoterNameEn": "SANTOSH KANWAR ", "contactno": "9887532929"}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 87, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MANASINGH ", "RelationName2": "मानसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 59, "VoterId": "RJ/25/194/018179", "VoterName": "भवर कंवर ", "VoterNameEn": "BHAVAR KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 87, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "KHUMANASINGH ", "RelationName2": "खुमाणसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 60, "VoterId": "MTW1036771", "VoterName": "प्रहलादसिंह ", "VoterNameEn": "PRAHALADASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 82, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "PRAHALADASINGH ", "RelationName2": "प्रहलादसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 61, "VoterId": "MTW1036789", "VoterName": "मोहनकवर ", "VoterNameEn": "MOHANAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 81, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NARAPATASINGH ", "RelationName2": "नरपतसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 62, "VoterId": "RJ/25/194/018197", "VoterName": "भवर कंवर ", "VoterNameEn": "BHAVAR KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 66, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MANASINGH ", "RelationName2": "मानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 63, "VoterId": "RJ/25/194/018140", "VoterName": "बजरंगसिंह ", "VoterNameEn": "BAJARANGASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 66, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJARANGASINGH ", "RelationName2": "बजरंगसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 64, "VoterId": "RJ/25/194/018159", "VoterName": "मेनकवर ", "VoterNameEn": "MENAKAVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 60, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MANASINGH ", "RelationName2": "मानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 65, "VoterId": "MTW1395912", "VoterName": "अनोपसिंह ", "VoterNameEn": "ANOPASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 58, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "PRAHALAD SIH ", "RelationName2": "प्रहलाद सिह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 66, "VoterId": "AZB0111849", "VoterName": "बहादुर सिंह ", "VoterNameEn": "BAHADUR SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 57, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "ANOPASINGH ", "RelationName2": "अनोपसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 67, "VoterId": "MTW1395904", "VoterName": "रामकंवर ", "VoterNameEn": "RAMAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 56, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MANASINGH ", "RelationName2": "मानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 68, "VoterId": "AZB0011916", "VoterName": "गोविन्दसिंह ", "VoterNameEn": "GOVINDASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 53, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "MANASINGH ", "RelationName2": "मानसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 69, "VoterId": "RJ/25/194/018119", "VoterName": "नन्दसिंह ", "VoterNameEn": "NANDASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 53, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAHADURASINGH ", "RelationName2": "बहादुरसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 70, "VoterId": "AZB0371906", "VoterName": "रेवन्तकंवर ", "VoterNameEn": "REVANTAKANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 52, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GOVINDASINGH ", "RelationName2": "गोविन्दसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 71, "VoterId": "RJ/25/194/018122", "VoterName": "सोहन कंवर ", "VoterNameEn": "SOHAN KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 50, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "NANDASINGH ", "RelationName2": "नन्दसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 72, "VoterId": "RJ/25/194/018128", "VoterName": "मगन कंवर ", "VoterNameEn": "MAGAN KANVAR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 42, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GIRAGHARISINGH ", "RelationName2": "गिरघारीसिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 73, "VoterId": "AZB0111856", "VoterName": "सरला कंवर ", "VoterNameEn": "Sarala Kakawar ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 42, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJARANGASINGH ", "RelationName2": "बजरंगसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 74, "VoterId": "RJ/25/194/018133", "VoterName": "प्रकाशसिंह ", "VoterNameEn": "PRAKASHASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 39, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "BAJARANGASINGH ", "RelationName2": "बजरंगसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 75, "VoterId": "MTW1038512", "VoterName": "अर्जुन सिंह ", "VoterNameEn": "ARJUN SINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 39, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "GOVINDASINGH ", "RelationName2": "गोविन्दसिंह ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 76, "VoterId": "MTW1038520", "VoterName": "दलीपसिंह ", "VoterNameEn": "DALIPASINGH ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 33, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "DALIP SINGH ", "RelationName2": "दलीप सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 77, "VoterId": "AZB0012203", "VoterName": "विमला कवंर ", "VoterNameEn": "VIMALA KAVANR ", "contactno": ""}, {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 33, "HouseNo": "10", "HouseNoEN": "10", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "PRAKASH SINGH ", "RelationName2": "प्रकाश सिंह ", "RelayionType": "H", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "F", "SlNo": 78, "VoterId": "AZB0012211", "VoterName": "सुमन कंवर ", "VoterNameEn": "SUMAN KANVAR ", "contactno": ""}]
const filterData = async (searchKey, sortingCrieteria = null,memberId) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars
    return new Promise(async (resolve, reject) => {
        let tempMemberArray = [];
        let tempVoterId = []
        let tempBoothId = []
        let volunteerCondition = null;
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
                WardCode: searchKey.BoothName,
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

        await getAllAdminMemberId().then((adminId)=>{
            if(adminId){
                tempVoterId.push(...adminId)
            }
        })
        await getUserRole(memberId).then(async (userRole)=>{
            if(userRole === VOLUNTEER){
                volunteerCondition = {
                    VolunteerId: { [Op.eq]: memberId },
                };
                await volunteer_booth.findAll({
                    attributes:['BoothId'],
                    where:volunteerCondition
                }).then((volunteerBoothData)=>{
                    if(volunteerBoothData){
                        volunteerBoothData.map((item)=>{
                            tempBoothId.push(item.dataValues.BoothId)
                        })
                        memberMasterCondition = {
                            ...memberMasterCondition,
                            BoothId: { [Op.in]: tempBoothId },
                        };
                    }
                })
                await getAllVolunteerId().then((volunteerId)=>{
                    if(volunteerId){
                        tempVoterId.push(...volunteerId)
                    }
                })
            }
        })
        memberMasterCondition = {
            ...memberMasterCondition,VoterId: { [Op.notIn]: tempVoterId },
        };

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
                        attributes: ["WardName","WardCode"],
                        model: wardMaster,
                        where:boothMasterCondition
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["VidhanSabhaName"],
                        model: vidhanSabhaMaster,
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["PollingBoothName"],
                        model: polling_booth_master,
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

const getAllMembers = async (offset, pageNo,memberId) => {
    let tempMemberArray = [];
    let tempVoterId = [memberId]
    let tempBoothId = []
    let condition = {
        VoterId: { [Op.notIn]: tempVoterId },
    };
    let volunteerCondition = null;
    await getAllAdminMemberId().then((adminId)=>{
        if(adminId){
            tempVoterId.push(...adminId)
        }
    })
    await getUserRole(memberId).then(async (userRole)=>{
            if(userRole === VOLUNTEER){
                 volunteerCondition = {
                     VolunteerId: { [Op.eq]: memberId },
                };
                await volunteer_booth.findAll({
                     attributes:['BoothId'],
                     where:volunteerCondition
                 }).then((volunteerBoothData)=>{
                     if(volunteerBoothData){
                         volunteerBoothData.map((item)=>{
                             tempBoothId.push(item.dataValues.BoothId)
                         })
                         condition = {
                             ...condition,
                             BoothId: { [Op.in]: tempBoothId },
                         };
                     }
                 })
                await getAllVolunteerId().then((volunteerId)=>{
                    if(volunteerId){
                        tempVoterId.push(...volunteerId)
                    }
                })
            }
    })

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
            where:condition,
            order: [
                [
                    sequelize.fn(
                        "concat",
                        sequelize.col("VoterMaster.FirstName"),
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
                    attributes: ["VidhanSabhaName"],
                    model: vidhanSabhaMaster,
                    // as: "OccupationDetail",
                },
                {
                    attributes: ["PollingBoothName"],
                    model: polling_booth_master,
                    // as: "OccupationDetail",
                },
                {
                    attributes: ["WardName","WardCode"],
                    model: wardMaster,
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
            offset,
            limit: pageLimit,
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
const getAllInclunecerMembers = async (memberId) => {
    let tempMemberArray = [];
    let tempVoterId = [memberId]
    let tempBoothId = []
    let condition = {
        VoterId: { [Op.notIn]: tempVoterId },
        IsInfluencer: { [Op.eq]: 1 },
    };
    let volunteerCondition = null;
    await getAllAdminMemberId().then((adminId)=>{
        if(adminId){
            tempVoterId.push(...adminId)
        }
    })
    await getUserRole(memberId).then(async (userRole)=>{
        if(userRole === VOLUNTEER){
            volunteerCondition = {
                VolunteerId: { [Op.eq]: memberId },
            };
            await volunteer_booth.findAll({
                attributes:['BoothId'],
                where:volunteerCondition
            }).then((volunteerBoothData)=>{
                if(volunteerBoothData){
                    volunteerBoothData.map((item)=>{
                        tempBoothId.push(item.dataValues.BoothId)
                    })
                    condition = {
                        ...condition,
                        BoothId: { [Op.in]: tempBoothId },
                    };
                }
            })
            await getAllVolunteerId().then((volunteerId)=>{
                if(volunteerId){
                    tempVoterId.push(...volunteerId)
                }
            })
        }
    })
    await voterMaster
        .findAll({
            attributes: VOTER_ATTRIBUTES,
            where:condition,
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
const searchData = async (searchKey,memberId) => {
    // eslint-disable-next-line no-async-promise-executor,no-unused-vars
    return new Promise(async (resolve, reject) => {
        let tempMemberArray = [];
        let dob = "";
        let tempVoterId = [memberId]
        let tempBoothId = []
        let volunteerCondition = null;

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

        let condition = {
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
        await getAllAdminMemberId().then((adminId)=>{
            if(adminId){
                tempVoterId.push(...adminId)
            }
        })
        await getUserRole(memberId).then(async (userRole)=>{
            if(userRole === VOLUNTEER){
                volunteerCondition = {
                    VolunteerId: { [Op.eq]: memberId },
                };
                await volunteer_booth.findAll({
                    attributes:['BoothId'],
                    where:volunteerCondition
                }).then((volunteerBoothData)=>{
                    if(volunteerBoothData){
                        volunteerBoothData.map((item)=>{
                            tempBoothId.push(item.dataValues.BoothId)
                        })
                        condition = {
                            ...condition,
                            BoothId: { [Op.in]: tempBoothId },
                        };
                    }
                })
                await getAllVolunteerId().then((volunteerId)=>{
                    if(volunteerId){
                        tempVoterId.push(...volunteerId)
                    }
                })
            }
        })
        condition = {
            ...condition,VoterId: { [Op.notIn]: tempVoterId },
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
                        attributes: ["VidhanSabhaName"],
                        model: vidhanSabhaMaster,
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["PollingBoothName"],
                        model: polling_booth_master,
                        // as: "OccupationDetail",
                    },
                    {
                        attributes: ["WardName","WardCode"],
                        model: wardMaster,
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
    console.log(memberArrayForProfile[0])
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

const getMemberData = (offset, pageNo,memberId) => {
    return new Promise((resolve) => {
        // eslint-disable-next-line no-shadow
        let nextUrl = "";
        if (offset < 0) {
            pageLimit = totalMembers;
            offset = 0;
        } else {
            pageLimit = PAGE_LIMIT;
        }

        getAllMembers(offset, pageNo,memberId).then((data) => {
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
const getBoothAddress = (boothId) =>{
    return new Promise((resolve)=>{
        let boothMasterCondition = {WardId: { [Op.eq]: boothId }};
        wardMaster.findOne({where:boothMasterCondition}).then((wardData)=>{
            if(wardData){
                let obj = {
                    "Address":wardData.dataValues.WardAddress,
                    "CityOrVillageName":wardData.dataValues.WardCity,
                    "DistrictName":wardData.dataValues.DistrictName,
                    "StateName":wardData.dataValues.WardState,
                    "CountryName":"INDIA",
                }
                return resolve(obj)
            } else {
                return resolve(false)
            }
        }).catch((err)=>{
            return resolve(false)
        })

    })
}
const addAllAdress = (array) =>{
    return new Promise(async (resolve)=>{
        let addressArray = []
        await array.map((item)=>{
            addressArray.push({Address:item.HouseNoEN+","+item.SectionNameEn})
        })
        let tempArray = await removeDuplicates(addressArray,"Address");
        let tempFinalArrayForAddress = tempArray
        await tempArray.map((item,index)=>{
            let condition = {Address: { [Op.eq]: item.Address }};
            addressMaster.findOne({where:condition}).then((res)=>{
                if(res){
                    if(index >= tempArray.length-1) {
                        return resolve(true)
                    }
                } else {
                    addressMaster.create({Address:item.Address}).then((isNewCreate)=>{
                        console.log("new created")
                        if(index >= tempArray.length-1) {
                            return resolve(true)
                        }
                    })
                }
            })
        })
    })
}

const getAddressID = (address)=>{
    return new Promise((resolve)=>{
        if(!isDefined(address)){
            return resolve(null)
        }
        let condition = {Address: { [Op.eq]: address }};
        addressMaster.findOne({where:condition}).then(async (isAddressAvailable)=>{
            if(isAddressAvailable){
                return resolve(isAddressAvailable.dataValues.AddressId)
            } else {
                let insAddressObj = {
                    "Address":address,
                }
                addressMaster.create(insAddressObj).then((isNewAddressCreated)=>{
                    if(isNewAddressCreated){
                        console.log("created new--")
                        return resolve(isNewAddressCreated.dataValues.AddressId)
                    } else {
                        console.log("failt to create new--")
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
        if(!isDefined(middleName) || !isDefined(age)){
            return resolve(null)
        }
        let condition = {FirstName: { [Op.like]: `%${middleName.trim()}%` },};
        voterMaster.findAll({where:condition}).then((isParentDataAvailable)=>{
            if(isParentDataAvailable){
                if(isParentDataAvailable.length ===0){
                    return resolve(null)
                }
                else if(isParentDataAvailable.length === 1){
                    if(isParentDataAvailable[0].dataValues.FamilyId === familyId){
                        if(needToCheckAge && (isParentDataAvailable[0].dataValues.Age - age) >=15){
                            resolve(isParentDataAvailable[0].dataValues.VoterId)
                        } else {
                            resolve(isParentDataAvailable[0].dataValues.VoterId)
                        }
                    } else {
                        return resolve(null)
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
                            return resolve(null)
                        }
                    })
                }
            } else {
                return resolve(null)
            }
        }).catch((err)=>{
            return resolve(null)
        })
    })
}
const checkMemberExistAndEnterDetails = (obj) =>{
    return new Promise((resolve)=>{
        let condition = {FirstName: { [Op.like]: `%${obj.FirstName.trim()}%` },
            MiddleName: { [Op.like]: `%${obj.MiddleName.trim()}%` },
            Age: { [Op.eq]: `${obj.Age}` },
            Gender: { [Op.eq]: `${obj.Gender}` },
            // FamilyId: { [Op.eq]: `${obj.FamilyId}` },
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
                    console.log("error",err)
                    resolve(false)
                })
                resolve(false)
            }
        }).catch((err)=>{
            console.log("err-",err)
            resolve(false)
        })
    })
}

// {"AcName": "डीडवाना", "AcNameEn": "Deedwana", "AcNo": 107, "Age": 75, "HouseNo": "1के", "HouseNoEN": "1K", "PartName": "नागौर", "PartNameEn": "Nagaur", "PartNo": 1, "Polling AddressEn": "SHAHEED HEMRAJ GOVERNMENT SENIOR SECONDARY SCHOOL  MAMRODA LEFT PART", "PollingAddress": "शहीद हेमराज राजकीय उच्च माध्यमिक विद्यालय  मामड़ोदा बांया भाग", "RelationName": "CHHOTU RAM ", "RelationName2": "छोटू राम ", "RelayionType": "F", "SectionName": "राजपूतों का मोहल्ला पश्चिमी,मामड़ोदा", "SectionNameEn": "RAJAPUTON KA MOHALLA PASHCHIMI,MAMADODA", "SectionNo": 1, "Sex": "M", "SlNo": 1, "VoterId": "AZB1038934", "VoterName": "बजरंग लाल ", "VoterNameEn": "BAJRANG LAL ", "contactno": ""}
const getVidhanSabhaId = (name) =>{
    return new Promise((resolve)=>{
        if(typeof name==='undefined'){
            return resolve(null)
        }
        let condition = {
            VidhanSabhaName: { [Op.like]: `%${name.trim()}%` },
        };
        vidhanSabhaMaster.findOne({where:condition}).then((isExist)=>{
            if(isExist){
                return resolve(isExist.dataValues.VidhanSabhaId)
            } else {
                let createNewVidhanSabhaObj = {
                    VidhanSabhaName:name.trim()
                }
                vidhanSabhaMaster.create(createNewVidhanSabhaObj).then((isNewCreated)=>{
                    if(isNewCreated){
                        return resolve(isNewCreated.dataValues.VidhanSabhaId)
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
const getPollingBoothStationId = (name) =>{
    return new Promise((resolve)=>{
        if(!isDefined(name)){
            return resolve(null)
        }
        let condition = {
            PollingBoothName: { [Op.like]: `%${name.trim()}%` },
        };
        polling_booth_master.findOne({where:condition}).then((isExist)=>{
            if(isExist){
                return resolve(isExist.dataValues.PollingBoothStationId)
            } else {
                let createNewBoothObj = {
                    PollingBoothName:name.trim(),
                }
                polling_booth_master.create(createNewBoothObj).then((isNewCreated)=>{
                    if(isNewCreated){
                        return resolve(isNewCreated.dataValues.PollingBoothStationId)
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
const getBoothId= (name,boothNo) =>{
    return new Promise((resolve)=>{
        if(typeof name === 'undefined'){
            return resolve(null)
        } else {
            let condition = {
                WardName: { [Op.like]: `%${name}%` },
            };
            let insertNewObj = {
                WardName : name.trim()
            }
            if(isDefined(boothNo)){
                condition = {
                    ...condition,
                    WardCode: { [Op.eq]: `${boothNo}` },
                }
                insertNewObj = {
                    ...insertNewObj,
                    WardCode:boothNo
                }
            }
            // if(isDefined(boothAddress)){
            //     condition = {
            //         ...condition,
            //         WardAddress: { [Op.like]: `%${boothAddress.trim()}%` },
            //     }
            //     insertNewObj = {
            //         ...insertNewObj,
            //         WardAddress:boothAddress.trim()
            //     }
            // }
            wardMaster.findOne({where:condition}).then((isExisted)=>{
                if(isExisted){
                    return resolve(isExisted.dataValues.WardId)
                } else {
                    wardMaster.create(insertNewObj).then((isNewCreated)=>{
                        if(isNewCreated){
                            return resolve(isNewCreated.dataValues.WardId)
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

const insertBulkDataInDb = (dataArray) =>{
    let insvidhanSabhaId = null;
    let insboothId = null;
    let inspollingStationId = null;
    let insfamilyId = null;
    let insparentId = null;
    let insaddressId = null;
    return new Promise(async (resolve)=>{
        let tempArray = []
        console.log("data coount---",dataArray.length)
        let arrayLength = dataArray.length
        await dataArray.map((item)=>{
            tempArray.push({...item,Address:item.HouseNoEN+","+item.SectionNameEn})
        })
        tempArray = await loadash.groupBy(tempArray, "Address");
        let updateCounter = 0;
        for (const key in tempArray) {
            if (tempArray.hasOwnProperty(key)) {
                const value = tempArray[key];
                insaddressId = await getAddressID(key);
                insfamilyId = await getFamilyId(insaddressId);
                const result = await value.map(async (memberDetail)=>{
                        if(isDefined(memberDetail.AcNameEn)){
                            insvidhanSabhaId = await getVidhanSabhaId(memberDetail.AcNameEn);
                        }
                        if(isDefined(memberDetail.PartNameEn) && isDefined(memberDetail.SectionNo)){
                            insboothId = await getBoothId(memberDetail.PartNameEn,memberDetail.SectionNo);
                        }
                        if(isDefined(memberDetail.PollingAddressEn)){
                            inspollingStationId = await getPollingBoothStationId(memberDetail.PollingAddressEn);
                        }
                        if(isDefined(memberDetail.RelationName) && isDefined(memberDetail.Age) && isDefined(memberDetail.RelayionType) ){
                            insparentId = await getParentId(memberDetail.RelationName,memberDetail.Age,insaddressId,memberDetail.RelayionType.toLowerCase() === 'f'?true:false);
                        }
                        let insMemberObj = {
                            FirstName:memberDetail.VoterNameEn,
                            MiddleName:memberDetail.RelationName,
                            Age:memberDetail.Age,
                            Gender:memberDetail.Sex.toLowerCase() ==='m'?'male':'female',
                            VoterVotingId:memberDetail.VoterId,
                            FamilyId:insfamilyId,
                            BoothId:insboothId,
                            VidhanSabhaId:insvidhanSabhaId,
                            PollingStationId:inspollingStationId,
                            VoterHindiName:memberDetail.VoterName
                        }
                        if(memberDetail.RelayionType.toLowerCase() === 'f'){
                            insMemberObj = {...insMemberObj,FatherId:insparentId}
                        } else {
                            insMemberObj = {...insMemberObj,SpouseId:insparentId}
                        }
                        let isMemberCreated = await checkMemberExistAndEnterDetails(insMemberObj);
                        updateCounter = updateCounter + 1;
                        if(updateCounter >= arrayLength-1){
                            console.log(updateCounter,"array lengt--",arrayLength)
                            return resolve(true)
                        }
                })
                // return resolve(true)
            }
        }
    })
}

const insertBulkDataInDbForWeb = (dataArray) =>{
    let insvidhanSabhaId = null;
    let insboothId = null;
    let inspollingStationId = null;
    let insfamilyId = null;
    let insparentId = null;
    let insaddressId = null;
    return new Promise(async (resolve)=>{
        let tempArray = []
        let arrayLength = dataArray.length
        await dataArray.map((item)=>{
            tempArray.push({...item,Address:item.HouseNoEN+","+item.SectionNameEn})
        })
        tempArray = await loadash.groupBy(tempArray, "Address");
        let updateCounter = 0;
        for (const key in tempArray) {
            if (tempArray.hasOwnProperty(key)) {
                const value = tempArray[key];
                insaddressId = await getAddressID(key);
                insfamilyId = await getFamilyId(insaddressId);
                const result = value.map(async (memberDetail)=>{
                    if(isDefined(memberDetail.AcNameEn) && isDefined(memberDetail.PollingAddressEn) && isDefined(memberDetail.Age) && isDefined(memberDetail.SectionNameEn) &&
                        isDefined(memberDetail.PartNameEn) && isDefined(memberDetail.RelationName)  && isDefined(memberDetail.RelayionType) && isDefined(memberDetail.Sex)
                        && isDefined(memberDetail.VoterId)  && isDefined(memberDetail.SectionNo) && isDefined(memberDetail.VoterNameEn) && isDefined(memberDetail.VoterName)
                    ){
                        insvidhanSabhaId = await getVidhanSabhaId(memberDetail.AcNameEn);
                        insboothId = await getBoothId(memberDetail.PartNameEn,memberDetail.SectionNo);
                        inspollingStationId = await getPollingBoothStationId(memberDetail.PollingAddressEn);
                        insparentId = await getParentId(memberDetail.RelationName,memberDetail.Age,insaddressId,memberDetail.RelayionType.toLowerCase() === 'f'?true:false);
                        let insMemberObj = {
                            FirstName:memberDetail.VoterNameEn,
                            MiddleName:memberDetail.RelationName,
                            Age:memberDetail.Age,
                            Gender:memberDetail.Sex.toLowerCase() ==='m'?'male':'female',
                            VoterVotingId:memberDetail.VoterId,
                            FamilyId:insfamilyId,
                            BoothId:insboothId,
                            VidhanSabhaId:insvidhanSabhaId,
                            PollingStationId:inspollingStationId,
                            VoterHindiName:memberDetail.VoterName
                        }
                        if(memberDetail.RelayionType.toLowerCase() === 'f'){
                            insMemberObj = {...insMemberObj,FatherId:insparentId}
                        } else {
                            insMemberObj = {...insMemberObj,SpouseId:insparentId}
                        }
                        let newMemberObj = [];
                        let isMemberCreated = await checkMemberExistAndEnterDetails(insMemberObj);
                        // if(!isMemberCreated){
                        //     newMemberObj.push(insMemberObj)
                        // }
                        updateCounter = updateCounter + 1;
                        if(updateCounter >= arrayLength-1){
                            // voterMaster.bulkCreate([...newMemberObj]).then((isNewMemberCreated)=>{
                            //     if(isNewMemberCreated){
                            //         resolve(true)
                            //     } else {
                            //         resolve(false)
                            //     }
                            // }).catch((err)=>{
                            //     resolve(false)
                            // })
                            return resolve(true)
                        }
                    }
                })
            }
        }
    })
}

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

const insertBulkVoterList = (data) =>{
    return new Promise(async (resolve)=>{
       try {
           if (data.length > 1 && data.length<1000) {
               const header = data[0];
               let headerObj = {};
               header.map((item) => {
                   headerObj = {...headerObj, [item]: item};
               });
               if (
                 isDefined(headerObj?.electionId) &&
                 isDefined(headerObj?.boothId) &&
                 isDefined(headerObj?.voterName) &&
                 isDefined(headerObj?.village) &&
                 isDefined(headerObj?.voterCategory) &&
                 isDefined(headerObj?.mandalName) &&
                 isDefined(headerObj?.phoneNumber) &&
                 isDefined(headerObj?.shaktiKendraName) &&
                 isDefined(headerObj?.familyNumber) &&
                 isDefined(headerObj?.dob)
               ) {
                   const dataWithoutHeader = data.slice(1,data.length);
                   let inputObj = {};
                   let inputObjArray = [];
                   dataWithoutHeader.map((item)=>{
                       item.map((rowData,index)=>{
                           inputObj = {...inputObj,[header[index]]:rowData}
                       })
                       inputObjArray.push(inputObj)
                   })
                   const bulkInsertRes = await voter_list_master.bulkCreate(inputObjArray);
                   if(bulkInsertRes){
                       return resolve(true);
                   } else {
                       return resolve(false);
                   }
               } else {
                   resolve(false)
               }
           } else {
               resolve(false)
           }
       }catch(ex){
           resolve(false)
       }
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
    getSpecificMemberDetail,
    getAllInclunecerMembers,
    getPollingBoothStationId,
    getVidhanSabhaId,
    getAddressID,
    addAllAdress,
    insertBulkDataInDbForWeb,
    insertBulkVoterList
};
