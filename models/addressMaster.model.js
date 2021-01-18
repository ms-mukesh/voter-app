const { Sequelize, sequelize } = require("../config/sequlize");

const AddressMaster = sequelize.define(
    "AddressMaster",
    {
        AddressId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
                fields: ["AddressId"],
            },
        ],
    }
);
module.exports = AddressMaster;
