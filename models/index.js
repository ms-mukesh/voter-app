const { Sequelize, sequelize } = require("../config/sequlize");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.voterMaster = require("./voterMaster.model")
db.adminMaster = require("./adminMaster.model")
db.voterDescription = require("./voterDescription.model")
db.addressMaster = require("./addressMaster.model")
db.wardMaster = require("./wardMaster.model")
db.nativePlaceMaster = require("./nativePlaceMaster.model")
db.castMaster = require("./castMaster.model")
db.occupationMaster = require("./occupationMaster.model")
db.notificationTypeMaster = require("./notificationType.model")
db.notificationMaster = require("./notificationMaster.model")
db.notificationDetails = require("./notificationDetails.model")
db.familyMaster = require("./familyMaster.model")
db.officeAddressMaster = require("./officeAddressMaster.model")
db.trustFactorMaster = require("./trustFactor.model")
db.eventMaster = require("./eventMaster.model")
db.taskMaster = require("./taskMaster.model")
db.digitalMasterCategory = require("./digitalPrinterCategory.model")
db.templateMaster = require("./templateList.model")
db.memberTemplateMaster = require("./memberTemplates.model")
db.familyRoleMaster = require("./familyRoleMaster.model")
db.vidhanSabhaMaster = require("./vidhanSabhaMaster.model")
db.volunteer_booth = require("./volunteer_booth.model")
db.voterMasterRequest = require("./voterMasterRequest.model");
db.mlaMaster = require("./MLAMaster.model")
db.electionMaster = require("./electionMaster.model")
db.election_voter = require("./election_voter.model");
db.volunteer_election = require("./volunteer_election.model");
db.survey_master = require("./surveyMaster.Model");
db.survey_question_master = require("./surveyQuestionMaster.model");
db.survey_answer_master = require("./survey_answer_master.model");
db.polling_booth_master = require("./pollingBoothMaster.model");
db.voter_list_master = require("./voterList.model");
db.voterListElectionMaster = require("./voterListWithElectionMaster.model");
module.exports = db;
