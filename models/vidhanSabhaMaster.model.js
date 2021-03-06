const { Sequelize, sequelize } = require("../config/sequlize");

const VidhanSabhaMaster = sequelize.define(
    "VidhanSabhaMaster",
    {
        VidhanSabhaId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        VidhanSabhaName:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        VidhanSabhaCode:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        Address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        CityOrVillageName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        DistrictName:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        StateName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        CountryName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        Phone1: {
            type: Sequelize.STRING,
            allowNull: true
        },
        Phone2: {
            type: Sequelize.STRING,
            allowNull: true
        },
        PinCode: {
            type: Sequelize.STRING,
            allowNull: true
        },

    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            {
                unique: false,
                fields: ["VidhanSabhaId"],
            },
        ],
    }
);
module.exports = VidhanSabhaMaster;
