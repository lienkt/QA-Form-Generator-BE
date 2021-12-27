/**
 * Images and pdfs merger
 * @author: lienkt
 */

"use strict";
const fs = require('fs');
const PDFMerger = require('pdf-merger-js');
const path = require('path')
const utils = require('util')
const readFile = utils.promisify(fs.readFile)
const puppeteer = require('puppeteer')
const handlebars = require('handlebars');

/**
 * Img and Pdf Merger
 * @param string hostname: host url
 * @param array data: project data
 * @param string pdfFileName: pdf File Name
 */
const imgnPdfMerger = async (hostname, data, pdfFileName) => {
    var merger = new PDFMerger()
    merger.add('./projects/' + data.projectName + '/' + pdfFileName)
    var mergerList = []

    // 1. Company overview
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Client description', data.answer2ImgList, data.answer2FileList))

    // 2. Objectives of the application or website
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Skincare, makeup products', data.answer4ImgList, data.answer4FileList))

    // 3. Target addressed by the application or the website
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Perfumes', data.answer5ImgList, data.answer5FileList))
    
    // 4. Quantitative objectives
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Clothes', data.answer6ImgList, data.answer6FileList))
    
    // 5. Type of application and media
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Shoes', data.answer7ImgList, data.answer7FileList))
    
    // 6. Project scope
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Bags', data.answer8ImgList, data.answer8FileList))
    
    // Get pages for menu2 content:
    // 1. Graphic charter
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Foods', data.answer9ImgList, data.answer9FileList))
    
    // 2. Previous order / Model
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Previous order', '[]', data.answer10FileList))

    // Get pages for menu3 content:
    // 1. User journey and application content
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Questions', data.answer11ImgList, data.answer11FileList))
    
    // 2. Technical constraints
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Requiments', data.answer12ImgList, data.answer12FileList))
    
    // 3. Expected deliverables
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Expected deliverables', data.answer13ImgList, data.answer13FileList))
    
    // 4. Other information on the project and useful documents
    mergerList = mergerList.concat(await addMergeredFile(hostname, data.projectName, 'Delivery infomations', data.answer17ImgList, data.answer17FileList))
    
    for (var i = 0; i < mergerList.length; i++) {
        if (mergerList[i].length > 0
            && fs.existsSync(mergerList[i])) {
            merger.add(mergerList[i]);  
        }
    }
    var filename = 'specifications.pdf'
    await merger.save('./projects/' + data.projectName + '/' + filename);
    console.log('Created ' + filename + '!')

    return filename
}

/**
 * Add Mergered File
 * @param string hostname: host url
 * @param string projectName: project Name
 * @param string folderName: folder Name
 * @param array imgList: img List
 * @param array fileList: file List
 * @return array fileList
 */
const addMergeredFile = async (hostname, projectName, folderName, imgList, fileList) => {
    var dir = './projects/' + projectName + '/attachments/' + folderName + '/'
    if (!fs.existsSync(dir)){
        return ''
    }
    var mergerList = []

    mergerList = mergerList.concat(await readImgList(dir + 'images/', imgList))
    mergerList = mergerList.concat(readFileList(dir + 'pdfs/', fileList))
    return mergerList
}

/**
 * Read Img List
 * @param string dir: dir
 * @param array imgList: img List
 * @return array fileList
 */
const readImgList = async (dir, imgList) => {
    var mergerList = []
    for (var i = 0; i < imgList.length; i++) {
        var filename = await generateImageToPdf(dir, imgList[i].name, imgList[i].url)
        if (filename.length > 0) {
            mergerList.push(dir + filename)
        }
    }
    return mergerList
}

/**
 * Read file List
 * @param string dir: dir
 * @param array fileList: file List
 * @return array fileList
 */
const readFileList = (dir, fileList) => {
    var mergerList = []
    for (var i = 0; i < fileList.length; i++) {
        mergerList.push(dir + fileList[i].name); 
    }
    return mergerList
}

/**
 * get Img Template Html
 * @return string template: html template
 */
const getImgTemplateHtml = async () => {
    try {
        const template = path.resolve("./templates/image_pdf_template.html");
        return await readFile(template, 'utf8');
    } catch (err) {
        return Promise.reject("Loading template is fail");
    }
}

/**
 * Generate Image To Pdf
 * @param string dir: dir
 * @param string imgName: img Name
 * @param string imgLink: img Link
 * @return string filename
 */
const generateImageToPdf = async (dir, imgName, imgLink) => {
    // Check directory:
    if (!fs.existsSync(dir + imgName)){
        return ''
    }
    
    // Create PDF file
    const browser = await puppeteer.launch()
    var filename = imgName + '.pdf'

    // Create page:
    console.log("Compiling template with data")
    var pageTemplate1 = await getImgTemplateHtml()
    const template1 = handlebars.compile(pageTemplate1, { strict: true })
    const result = template1({
        img: '<img class="img" ' +
                'src="' + imgLink + '">'
    });
    const html = result
    const page = await browser.newPage()
    await page.setContent(html)
    await page.pdf({
        path: dir + filename, 
        width: 842,
        height: 595,
        margin: 0,
        printBackground: true,
    })

    await browser.close();
    console.log("PDF file Generated!")
    return filename
}
module.exports = imgnPdfMerger