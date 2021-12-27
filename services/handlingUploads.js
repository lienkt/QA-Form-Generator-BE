/**
 * Handling uploads project information
 * @author: lienkt
 */

"use strict";
const fs = require('fs');
const nodemailer = require("nodemailer");
const path = require('path')
const utils = require('util')
const readFile = utils.promisify(fs.readFile)
const puppeteer = require('puppeteer')
const saveAttachments = require('../services/saveAttachments')
const pdfGenerator = require('../services/pdfGenerator')
const imgnPdfMerger = require('../services/imgnPdfMerger')

/**
 * Handling uploads
 * @param string hostname: host url
 * @param array data: project data
 */
const handlingUploads = async (hostname, data) => {
    data = parseJsonData(hostname, data)
    var zipFileName = await saveAttachments(data)
    var pdfFileName = await pdfGenerator(hostname, data)
    var finalPdfFileName = await imgnPdfMerger(hostname, data, pdfFileName)
    await sendEmail(data.projectName, finalPdfFileName, zipFileName, data.receivedEmail)
}

/**
 * to Array File List
 * @param string dir: directory url
 * @param string stringFileList: FileList in string type
 * @return array fileList
 */
const toArrayFileList = (dir, stringFileList) => {
    var fileList = [];
    var arrayFileList = JSON.parse(stringFileList)
    arrayFileList.forEach(file => {
        file = JSON.parse(file)
        file.url = dir + file.name
        fileList.push(file)
    })
    return fileList
}

/**
 * Parse Json Data to array
 * @param string hostname: host url
 * @param array data: project data
 */
const parseJsonData = (hostname, data) => {
    var dir = hostname + '/' + data.projectName + '/attachments/'
    data.answer2FileList  = toArrayFileList(dir + 'Client description/pdfs/', data.answer2FileList)
    data.answer2ImgList   = toArrayFileList(dir + 'Client description/images/', data.answer2ImgList)
    data.answer3FileList1 = toArrayFileList(dir + 'Avata/images/', data.answer3FileList1)
    data.answer3FileList2 = toArrayFileList(dir + 'Cover/images/', data.answer3FileList2)
    data.answer4FileList  = toArrayFileList(dir + 'Skincare, makeup products/pdfs/', data.answer4FileList)
    data.answer4ImgList   = toArrayFileList(dir + 'Skincare, makeup products/images/', data.answer4ImgList)
    data.answer5FileList  = toArrayFileList(dir + 'Perfumes/pdfs/', data.answer5FileList)
    data.answer5ImgList   = toArrayFileList(dir + 'Perfumes/images/', data.answer5ImgList)
    data.answer6FileList  = toArrayFileList(dir + 'Clothes/pdfs/', data.answer6FileList)
    data.answer6ImgList   = toArrayFileList(dir + 'Clothes/images/', data.answer6ImgList)
    data.answer7FileList  = toArrayFileList(dir + 'Shoes/pdfs/', data.answer7FileList)
    data.answer7ImgList   = toArrayFileList(dir + 'Shoes/images/', data.answer7ImgList)
    data.answer8FileList  = toArrayFileList(dir + 'Bags/pdfs/', data.answer8FileList)
    data.answer8ImgList   = toArrayFileList(dir + 'Bags/images/', data.answer8ImgList)
    data.answer9FileList  = toArrayFileList(dir + 'Foods/pdfs/', data.answer9FileList)
    data.answer9ImgList   = toArrayFileList(dir + 'Foods/images/', data.answer9ImgList)
    data.answer10FileList = toArrayFileList(dir + 'Previous order/pdfs/', data.answer10FileList)
    data.answer11FileList = toArrayFileList(dir + 'Questions/pdfs/', data.answer11FileList)
    data.answer11ImgList  = toArrayFileList(dir + 'Questions/images/', data.answer11ImgList)
    data.answer12FileList = toArrayFileList(dir + 'Requiments/pdfs/', data.answer12FileList)
    data.answer12ImgList  = toArrayFileList(dir + 'Requiments/images/', data.answer12ImgList)
    data.answer13FileList = toArrayFileList(dir + 'Expected deliverables/pdfs/', data.answer13FileList)
    data.answer13ImgList  = toArrayFileList(dir + 'Expected deliverables/images/', data.answer13ImgList)
    data.answer17FileList = toArrayFileList(dir + 'Delivery infomations/pdfs/', data.answer17FileList)
    data.answer17ImgList  = toArrayFileList(dir + 'Delivery infomations/images/', data.answer17ImgList)
    return data
}

/**
 * Send Email
 * @param string projectName: project Name
 * @param string pdfFileName: pdf File Name
 * @param string zipFileName: zip File Name
 * @param string receiver: receiver
 */
const sendEmail = async (projectName, pdfFileName, zipFileName, receiver) => {
    var attachments = []
    if (pdfFileName.length != 0) {
        attachments.push({   // file on disk as an attachment
            filename: pdfFileName,
            path: './projects/' + projectName + '/' + pdfFileName // stream this file
        })
    }
    if (zipFileName.length != 0) {
        attachments.push({   // file on disk as an attachment
            filename: zipFileName,
            path: './projects/' + projectName + '/' + zipFileName // stream this file
        })
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        port: 587,
        secure: false, // true for 465, false for other ports
        host: 'smtp.ionos.fr',
        auth: {
            user: process.env.SEND_EMAIL, // generated ethereal user
            pass: process.env.SEND_EMAIL_PW, // generated ethereal password
        },
    });
    
    var emailTemplate = await getEmailTemplateHtml()
    var sender = process.env.SEND_EMAIL

    receiver = receiver.length > 0  ? receiver : sender
    // send mail to customer
    let info = await transporter.sendMail({
        from: '<' + sender + '>', // sender address
        to: receiver,
        subject: "Specifications / Lien Kim",
        html: emailTemplate,
        attachments: attachments
    });
    console.log("Email sent: %s", info.messageId)
}

/**
 * Get Email Template Html
 * @return string template: html template
 */
const getEmailTemplateHtml = async () => {
    try {
        const template = path.resolve("./templates/email_template.html");
        return await readFile(template, 'utf8');
    } catch (err) {
        return Promise.reject("Loading template is fail");
    }
}
module.exports = handlingUploads