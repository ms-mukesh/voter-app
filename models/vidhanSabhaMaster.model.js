const { Sequelize, sequelize } = require("../config/sequlize");

const AddressMaster = sequelize.define(
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
            allowNull: false,
        },
        Address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        CityOrVillageName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        DistrictName:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        StateName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        CountryName: {
            type: Sequelize.STRING,
            allowNull: false,
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
module.exports = AddressMaster;
