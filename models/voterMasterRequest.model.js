const { Sequelize, sequelize } = require("../config/sequlize");
const addressMaster = require("./addressMaster.model");
const castMaster = require("./castMaster.model");
const nativePlaceMaster = require("./nativePlaceMaster.model");
const occupationMaster = require("./occupationMaster.model");
const familyMaster = require("./familyMaster.model");
const officeAddressMaster = require("./officeAddressMaster.model");
const trustFactorMaster = require("./trustFactor.model");
const familyRoleMaster = require("./familyRoleMaster.model");
const vidhanSabhaMaster = require("./vidhanSabhaMaster.model");
const boothMaster = require("./wardMaster.model");
const voterMaster = require("./voterMaster.model");



const VoterMasterRequest = sequelize.define(
    "VoterMasterRequest",
    {
        RequestUniqId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        VoterId:{
            type: Sequelize.INTEGER(11),
            allowNull:false
        },
        FirstName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        MiddleName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        LastName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        Email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        Mobile: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        DOB: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        RelationWithHead: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        MotherName: {
            type: Sequelize.STRING,
        },
        MotherNativePlaceId: {
            type: Sequelize.BIGINT,
        },
        AadhaarNo: {
            type: Sequelize.BIGINT,
        },
        MaritalStatus: {
            type: Sequelize.STRING,
        },
        BloodGroup: {
            type: Sequelize.ENUM,
            values: ["A+", "B+", "A-", "B-", "AB+", "AB-", "O+", "O-"],
        },
        Zodiac: {
            type: Sequelize.ENUM,
            values: [
                "Aries",
                "Taurus",
                "Gemini",
                "Cancer",
                "Leo",
                "Virgo",
                "Libra",
                "Scorpio",
                "Sagittarius",
                "Capricorn",
                "Aquarius",
                "Pisces",
            ],
        },
        Gender: {
            type: Sequelize.ENUM,
            values: ["male", "female"],
        },
        Studies: {
            type: Sequelize.STRING,
        },
        Password: {
            type: Sequelize.STRING,
        },
        MarriageDate: {
            type: Sequelize.DATE,
        },
        isAlive:{
            type: Sequelize.STRING,
        },
        dateDead:{
            type: Sequelize.STRING
        },
        IsDaughterFamily: {
            type: Sequelize.BIGINT,
        },
        MemberToken: {
            type: Sequelize.STRING,
        },
        ProfileImage: {
            type: Sequelize.STRING,
        },
        OtpCode: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        IsInfluencer: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        VoterVotingId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        IsOurVolunteer: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        GenerationLevel : {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        Age : {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        IsApproved :{
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        VoterHindiName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            {
                unique: false,
                fields: ["VoterId"],
            },
        ],
    }
);

VoterMasterRequest.belongsTo(VoterMasterRequest, {
    foreignKey: "FatherId",
    as: "FatherEntry",
});
VoterMasterRequest.belongsTo(VoterMasterRequest, {
    foreignKey: "FatherInLawId",
    as: "FatherInLawDetail",
});
VoterMasterRequest.belongsTo(VoterMasterRequest, {
    foreignKey: "MotherInLawId",
    as: "MotherInLawDetail",
});
VoterMasterRequest.belongsTo(VoterMasterRequest, {
    foreignKey: "MotherId",
    as: "MotherEntry",
});
VoterMasterRequest.belongsTo(VoterMasterRequest, {
    foreignKey: "SpouseId",
    as: "SpouseEntry",
});

VoterMasterRequest.belongsTo(voterMaster, {
    foreignKey: "ByVolunteer",
});
VoterMasterRequest.belongsTo(occupationMaster, {
    foreignKey: "OccupationId",
});

VoterMasterRequest.belongsTo(familyMaster, {
    foreignKey: "FamilyId",
});
VoterMasterRequest.belongsTo(officeAddressMaster, {
    foreignKey: "OfficeAddressId",
});
VoterMasterRequest.belongsTo(trustFactorMaster, {
    foreignKey: "TrustFactorId",
});
VoterMasterRequest.belongsTo(familyRoleMaster, {
    foreignKey: "FamilyRoleId",
});
VoterMasterRequest.belongsTo(vidhanSabhaMaster, {
    foreignKey: "VidhanSabhaId",
});
VoterMasterRequest.belongsTo(boothMaster, {
    foreignKey: "BoothId",
});
module.exports = VoterMasterRequest;
