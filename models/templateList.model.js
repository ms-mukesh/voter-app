const { Sequelize, sequelize } = require("../config/sequlize");

const digitalPrinterCategory = require("./digitalPrinterCategory.model");
const TemplateListMaster = sequelize.define("TemplateListMaster", {
    TemplateId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    TemplateName: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.STRING,
    },
    TemplateImage : {
        type: Sequelize.STRING,
    },
    TemplateRequirement : {
        type: Sequelize.STRING,
    }
},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["TemplateId"],
        },
    ],
});
TemplateListMaster.belongsTo(digitalPrinterCategory, {
    foreignKey: "CategoryId",
});

module.exports = TemplateListMaster;
