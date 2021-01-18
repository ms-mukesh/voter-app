const { Sequelize, sequelize } = require("../config/sequlize");
const voterMaster = require("./voterMaster.model");

const EventMaster = sequelize.define("EventMaster", {
    EventId:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
    },
    EventName: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.STRING,
    },
    Address: {
        type: Sequelize.STRING,
    },
    Organiser: {
        type: Sequelize.STRING,
    },
    Guest: {
        type: Sequelize.STRING,
    },
    EventDate:{
        type: Sequelize.STRING,
    },
},{
    freezeTableName: true,
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ["EventId"],
        },
    ],
});

EventMaster.belongsTo(voterMaster, {
    foreignKey: "EventMaker",
});


module.exports = EventMaster;
