/**
 * Project routes
 * @author: lienkt
 */

const { v4: uuidv4 } = require('uuid')

const projectModel = require('../models/projectSchema')
const handlingUploads = require('../services/handlingUploads')
var DomParser = require('dom-parser');

const express = require('express')
const Router = express.Router()

/**
 * Get all projects 
 */
Router.get('/', (req, res, next) => {
    projectModel.find()
    .sort({created_at: 'desc'})
    .then(projects => {
        res.status(200).send(projects);
    })
    .catch(error => next(error))
})

/**
 * Get project by id
 */
Router.get('/:projectId', (req, res, next) => {
    const projectId = req.params.projectId

    projectModel.findOne({
        _id: projectId
    })
    .then(project => {
        res.status(200).send(project)
    })
    .catch(error => next(error))

})

/**
 * Add a project
 */
Router.post('/', function (req, res, next) {
    handlingUploads(req.protocol + '://' + req.get('host'), req.body)
    
    let projectInfo = new projectModel({
        projectName: req.body.projectName,
        companyName: req.body.companyName,
        description: req.body.description,
        objectives: req.body.objectives,
        target: req.body.target,
        quantitativeObjectives: req.body.quantitativeObjectives,
        typeOfApp: req.body.typeOfApp,
        scope: req.body.scope,
        graphicCharter: req.body.graphicCharter,
        content: req.body.content,
        technicalContrain: req.body.technicalContrain,
        expectedDelivery: req.body.expectedDelivery,
        deploymentDate: req.body.deploymentDate,
        budget: req.body.budget,
        contactInfoName: req.body.contactInfoName,
        contactInfoFirstName: req.body.contactInfoFirstName,
        contactInfoEmail: req.body.contactInfoEmail,
        contactInfoPhone: req.body.contactInfoPhone,
        otherInfor: req.body.otherInfor,
        receivedEmail: req.body.receivedEmail
    })

    projectInfo.save()
    .then(project => res.status(200).send(project.projectName))
    .catch(error => {next(error)})
})

/**
 * Update a project
 */
Router.put('/:projectId', function (req, res, next) {
    const projectId = req.params.projectId
    
    projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        projectName: req.body.projectName,
        companyName: req.body.companyName,
        description: req.body.description,
        objectives: req.body.objectives,
        target: req.body.target,
        quantitativeObjectives: req.body.quantitativeObjectives,
        typeOfApp: req.body.typeOfApp,
        scope: req.body.scope,
        graphicCharter: req.body.graphicCharter,
        content: req.body.content,
        technicalContrain: req.body.technicalContrain,
        expectedDelivery: req.body.expectedDelivery,
        deploymentDate: req.body.deploymentDate,
        budget: req.body.budget,
        contactInfoName: req.body.contactInfoName,
        contactInfoFirstName: req.body.contactInfoFirstName,
        contactInfoEmail: req.body.contactInfoEmail,
        contactInfoPhone: req.body.contactInfoPhone,
        otherInfor: req.body.otherInfor,
        receivedEmail: req.body.receivedEmail
    })
    .then(project => res.status(200).send(project))
    .catch(error => next(error))
})

/**
 * Delete a project
 */
Router.delete('/:projectId', function (req, res, next) {
    const projectId = req.params.projectId
    
    projectModel.findOneAndDelete({
        _id: projectId
    }).then(project => {
        res.status(200).send('project well deleted!')
    })
    .catch(error => next(error))
})

module.exports = Router