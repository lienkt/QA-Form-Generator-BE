const { SafeString } = require("handlebars/runtime");
const mongoose = require("mongoose");

const movieModel = new mongoose.Schema({
    projectName: {
        type: String,
        require: true,
    },
    sentStatus: Boolean,
    companyName: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    objectives: {
        type: String,
        require: true
    },
    target: {
        type: String,
        require: true
    },
    quantitativeObjectives: {
        type: String,
        require: true
    },
    typeOfApp: {
        type: String,
        require: true
    },
    scope: {
        type: String,
        require: true
    },
    graphicCharter: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    technicalContrain: {
        type: String,
        require: true
    },
    expectedDelivery: {
        type: String,
        require: true
    },
    deploymentDate: {
        type: String,
        require: true
    },
    budget: {
        type: String,
        require: true
    },
    contactInfoName: {
        type: String,
        require: true
    },
    contactInfoFirstName: {
        type: String,
        require: true
    },
    contactInfoEmail: {
        type: String,
        require: true
    },
    contactInfoPhone: {
        type: String,
        require: true
    },
    otherInfor: {
        type: String,
        require: true
    },
    receivedEmail: {
        type: String,
        require: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model('projects', movieModel)