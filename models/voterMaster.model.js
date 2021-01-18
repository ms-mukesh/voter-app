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



const VoterMaster = sequelize.define(
    "VoterMaster",
    {
        VoterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
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
                "Vigro",
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
        }
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

VoterMaster.belongsTo(VoterMaster, {
    foreignKey: "FatherId",
    as: "FatherEntry",
});
VoterMaster.belongsTo(VoterMaster, {
    foreignKey: "FatherInLawId",
    as: "FatherInLawDetail",
});
VoterMaster.belongsTo(VoterMaster, {
    foreignKey: "MotherInLawId",
    as: "MotherInLawDetail",
});
VoterMaster.belongsTo(VoterMaster, {
    foreignKey: "MotherId",
    as: "MotherEntry",
});
VoterMaster.belongsTo(VoterMaster, {
    foreignKey: "SpouseId",
    as: "SpouseEntry",
});
VoterMaster.belongsTo(occupationMaster, {
    foreignKey: "OccupationId",
});

VoterMaster.belongsTo(familyMaster, {
    foreignKey: "FamilyId",
});
VoterMaster.belongsTo(officeAddressMaster, {
    foreignKey: "OfficeAddressId",
});
VoterMaster.belongsTo(trustFactorMaster, {
    foreignKey: "TrustFactorId",
});``
VoterMaster.belongsTo(familyRoleMaster, {
    foreignKey: "FamilyRoleId",
});
VoterMaster.belongsTo(vidhanSabhaMaster, {
    foreignKey: "VidhanSabhaId",
});
VoterMaster.belongsTo(boothMaster, {
    foreignKey: "BoothId",
});
module.exports = VoterMaster;
