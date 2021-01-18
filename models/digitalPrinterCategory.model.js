const { Sequelize, sequelize } = require("../config/sequlize");


const DigitalCategoryMaster = sequelize.define("DigitalCategoryMaster", {
    CategoryId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    CategoryName: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.STRING,
    },
},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["CategoryId"],
        },
    ],
});

module.exports = DigitalCategoryMaster;
