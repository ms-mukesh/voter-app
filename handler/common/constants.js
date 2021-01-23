const JWT_PRIVATE_KEY = "communityTopSecret";
const NETWORK_FAILED_MESSAGE = 'Failed to login due to network issue';
const DATA_NOT_FOUND_MESSAGE = 'Data not found';
const DATABASE_NAME = 'heroku_0f888c1c6017d15';//apk-1
// const DATABASE_NAME = 'heroku_0f888c1c6017d15';//apk-1
// const DATABASE_NAME = 'heroku_0f888c1c6017d15';//apk-1
// const DATABASE_NAME = 'heroku_0f888c1c6017d15';//apk-1
// const DATABASE_NAME = 'community_db';//local testing
const PAGE_LIMIT=30
const monthArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "jan",
    "feb",
    "mar",
    "apr",
    "jun",
    "july",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
];
const ADMIN_RECEIVER = 0;
const HEAD_RECEIVER = 1;
const VOLUNTEER_RECEIVER = 1;
const ALL_RECEIVER = 2;
const ALL_RECEIVER_MALE = 3;
const ALL_RECEIVER_FEMALE = 4;

const NOTIFICATION_LIMIT = 30;
const gender = ["MALE", "FEMALE"];
const marital_status = ["MARRIED", "SINGLE","WIDOW"];
const VOTER_ATTRIBUTES = [
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
    "IsDaughterFamily",
    "SpouseId",
    "IsInfluencer",
    "VoterVotingId",
    "BoothId",
    "Age"
]
module.exports={
    ADMIN_RECEIVER,
    HEAD_RECEIVER,
    ALL_RECEIVER,
    JWT_PRIVATE_KEY,
    NETWORK_FAILED_MESSAGE,
    PAGE_LIMIT,
    monthArray,
    DATA_NOT_FOUND_MESSAGE,
    NOTIFICATION_LIMIT,
    VOTER_ATTRIBUTES,
    gender,
    marital_status,
    VOLUNTEER_RECEIVER,
    ALL_RECEIVER_FEMALE,
    ALL_RECEIVER_MALE,
    DATABASE_NAME

}

