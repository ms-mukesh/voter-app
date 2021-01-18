const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");
const eventMaster = require("./eventMaster.model");



const TaskMaster = sequelize.define("TaskMaster", {
    TaskId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    TaskName: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.STRING,
    },
    DeadlineDate:{
        type: Sequelize.DATE,
    },
    Status:{
        type: Sequelize.STRING,
    },

},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["TaskId"],
        },
    ],
});

TaskMaster.belongsTo(voterMaster, {
    foreignKey: "VolunteerId",
});
TaskMaster.belongsTo(eventMaster, {
    foreignKey: "EventId",
});


module.exports = TaskMaster;
