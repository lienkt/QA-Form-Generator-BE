/**
 * Pdf generator
 * @author: lienkt
 */

 "use strict";
const fs = require('fs');
const path = require('path')
const utils = require('util')
const readFile = utils.promisify(fs.readFile)
const puppeteer = require('puppeteer')
const handlebars = require('handlebars');

/**
 * Pdf Generator
 * @param string hostname: hostname
 * @param array data: data
 * @return string filename
 */
const pdfGenerator = async (hostname, data) => {
    var contentMenu1 = [];
    var contentMenu2 = [];
    var contentMenu3 = [];
    // Get pages for menu1 content:
    // 1. Client description
    contentMenu1.push(getPage("1. Client description", 1, data.description, data.answer2ImgList, data.answer2FileList, null))
    // 2. Skincare, makeup products
    contentMenu1.push(getPage("2. Skincare, makeup products", 1, data.objective, data.answer4ImgList, data.answer4FileList, null))
    // 3. Perfumes
    contentMenu1.push(getPage("3. Perfumes", 1, data.target, data.answer5ImgList, data.answer5FileList, null))
    // 4. Clothes
    contentMenu1.push(getPage("4. Clothes", 1, data.quantitativeObjectives, data.answer6ImgList, data.answer6FileList, null))
    // 5. Shoes
    contentMenu1.push(getPage("5. Shoes", 1, data.typeOfApp, data.answer7ImgList, data.answer7FileList, null))
    // 6. Bags
    contentMenu1.push(getPage("6. Bags", 1, data.scope, data.answer8ImgList, data.answer8FileList, null))

    // Get pages for menu2 content:
    // 1. Foods
    contentMenu2.push(getPage("1. Foods", 1, data.graphicCharter, data.answer9ImgList, data.answer9FileList, null))
    // 2. Previous order
    contentMenu2.push(getPage("2. Previous order", 2, "", [], data.answer10FileList, null))

    // Get pages for menu3 content:
    // 1. Questions
    contentMenu3.push(getPage("1. Questions", 1, data.content, data.answer11ImgList, data.answer11FileList, null))
    // 2. Requiments
    contentMenu3.push(getPage("2. Requiments", 1, data.technicalContrain, data.answer12ImgList, data.answer12FileList, null))
    // 3. Expected deliverables
    contentMenu3.push(getPage("3. Expected deliverables", 1, data.expectedDelivery, data.answer13ImgList, data.answer13FileList, null))
    // 4. Delivery infomations
    contentMenu3.push(getPage("4. Delivery infomations", 3, data.otherInfo, data.answer17ImgList, data.answer17FileList, {
        "deploymentDate": data.deploymentDate,
        "budget": data.budget,
        "name": data.contactInfoFirstName + ' ' + data.contactInfoName,
        "email": data.contactInfoEmail,
        "phone": data.contactInfoPhone
    }));

    var pageNum1 = 2;
    var menu1 = generateContent(hostname, "Presentation", pageNum1, contentMenu1);
    var pageNum2 = 3 + menu1.pageCounts - 1;
    var menu2 = generateContent(hostname, "Specifications", pageNum2 + 1, contentMenu2);
    var pageNum3 = 5 +  menu1.pageCounts + menu2.pageCounts - 2;
    var menu3 = generateContent(hostname, "Questions", pageNum3 + 1, contentMenu3);
    var logo;
    if (data.answer3FileList1[0]) {
        logo = '<img class="logo" ' +
        'src="' + data.answer3FileList1[0].url + '">'
    } else {
        logo = '';
    }
    var cover_url;
    if (data.answer3FileList2[0]) {
        cover_url = data.answer3FileList2[0].url;
    } else {
        cover_url = hostname + '/images/default_cover.png';
    }
    var cover = '<img class="img-cover" ' +
        'src="' + cover_url + '">'
    var date = new Date()
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    var nextdata = {
        logo: logo,
        cover: cover,
        date: ("0" + date.getDate()).slice(-2) + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear(),
        menu3_content: menu1.pageContent,
        menu5_content: menu2.pageContent,
        menu7_content: menu3.pageContent,
        page_num_menu_2: pageNum2,
        page_num_menu_3: pageNum3
    }
    data = Object.assign(data, nextdata);

    // Create directory:
    var dir = './projects/' + data.projectName
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true })
    }
    
    // Create PDF file
    const browser = await puppeteer.launch()
    var filename = data.projectName + '_document.pdf'

    // Create page 1:
    console.log("Compiling template with data")
    var pageTemplate1 = await getTemplateHtml();
    const template = handlebars.compile(pageTemplate1, { strict: true });
    const result = template(data);
    const html = result
    const page = await browser.newPage()
    await page.setContent(html)
    await page.pdf({
        path: dir + '/' + filename, 
        width: 842,
        height: 595,
        margin: 0,
        printBackground: true,
    })

    await browser.close();
    console.log("PDF file Generated!")
    return filename
}

/**
 * Get each page
 * @param string title: title
 * @param string type: type of page
 * @param string text: text content
 * @param array imgList: img List
 * @param array pdfs: pdf List
 * @param array info: general info
 * @return array page info
 */
var getPage = (title, type, text, images, pdfs, info) => {
    var min_height = 0;
    var height = 0;
    if (type == 1) {
        // The type of answers have text, imgs, pdfs
        min_height = 47; // title: 47 + (text row: 24*1 + padding top: 16)
        height = 47 + textHeight(text) + imageBoxHeight(images) + pdfBoxHeight(pdfs);

    } else if (type == 2) {
        // The type of answers have 1 pdf
        min_height = 120; // title: 47 + pdf row: 73
        height = 120;
    } else {
        // The type of answers have 1 infomation box
        min_height = 221; // title: 47 + info box: 174
        height = min_height + textHeight(text) + imageBoxHeight(images) + pdfBoxHeight(pdfs);
    }
    return {
        "min_height": min_height,
        "height": height,
        "title": title,
        "type": type,
        "text": text,
        "images": images,
        "pdfs": pdfs,
        "info": info
    };
}

/**
 * Generate Content
 * @param string hostname: hostname
 * @param string subtitle: subtitle
 * @param number pageNum: page Number
 * @param array pages: page info list
 * @return array page content
 */
var generateContent = (hostname, subtitle, pageNum, pages) => {
    var pageContent = '';
    var pageTemplates = [];
    var haftPage = {
        "leftSpace": 470,
        "content": ''
    };
    for (var i = 0; i < pages.length; i++) {
        if (haftPage.leftSpace < pages[i].min_height) {
            pageTemplates.push(haftPage);
            haftPage = {
                "leftSpace": 470,
                "content": ''
            };
        }
        var cuttingResult = cutPageByHeight(hostname, haftPage, pages[i]);
        pageTemplates = pageTemplates.concat(cuttingResult.pages);
        if (cuttingResult.firstPart.leftSpace == 0) {
            haftPage = cuttingResult.sencondPart
        } else if (cuttingResult.firstPart.leftSpace != 0) {
            haftPage = cuttingResult.firstPart
        }
        if (i == pages.length - 1 && cuttingResult.firstPart.leftSpace != 0) {
            pageTemplates.push(cuttingResult.firstPart);
        }
    }
    for (var j = 0; j < pageTemplates.length; j++) {
        pageContent += getAnswerPageHtml(subtitle, pageTemplates[j].content, pageNum + j)
    }
    return {
        "pageCounts": pageTemplates.length,
        "pageContent": pageContent,
    };
}

/**
 * Cut page info by height to merge into page content list
 * @param string hostname: hostname
 * @param array haftPage: the left of previous page info
 * @param array page: next page info 
 * @return array page info
 */
var cutPageByHeight = (hostname, haftPage, page) => {
    var data = {
        "pages": [],
        "firstPart": {
            "leftSpace": haftPage.leftSpace - 47, // Title: 47,
            "content": haftPage.content + getAnswerTitleHtml(page.title)
        },
        "sencondPart": {
            "leftSpace": 470,
            "content": ''
        }
    };
    
    if (page.type == 1) {
        // The type of answers have text, imgs, pdfs
        // Set Answer Content
        data = cutPageByDataType(hostname, 1, page.text, data);

        // Set Images Content
        data = cutPageByDataType(hostname, 2, page.images, data);
        
        // Set Pdf Content
        data = cutPageByDataType(hostname, 3, page.pdfs, data);
    } else if (page.type == 2) {
        // The type of answers have 1 pdf
        // Set Pdf Content
        data = cutPageByDataType(hostname, 3, page.pdfs, data);
    } else {
        // The type of answers have 1 infomation box
        data = cutPageByDataType(hostname, 4, page.info, data);
        
        // Set Images Content
        data = cutPageByDataType(hostname, 2, page.images, data);
        
        // Set Pdf Content
        data = cutPageByDataType(hostname, 3, page.pdfs, data);

        // Set Answer Content
        data = cutPageByDataType(hostname, 1, page.text, data);
    }
    return data;
}

/**
 * Cut page info by data type to merge into page content
 * @param string hostname: hostname
 * @param number dataType: dataType
 * @param string|array content: data content
 * @param array input: input info to cut
 * @return array input: input info to cut next page
 */
var cutPageByDataType = (hostname, dataType, content, input) => {
    var result;
    if (dataType == 1) {
        result = generateTextContent(content, input.firstPart, input.sencondPart);
    } else if (dataType == 2) {
        result = generateImagesContent(content, input.firstPart, input.sencondPart);

    } else if (dataType == 3) {
        result = generateFilesContent(hostname, content, input.firstPart, input.sencondPart);

    } else if (dataType == 4) {
        result = generateInfoContent(content, input.firstPart, input.sencondPart);
    }
    if (result) {
        input.firstPart = result.firstPart;
        input.sencondPart = result.sencondPart;
        if (input.firstPart.leftSpace == 0) {
            input.pages.push(input.firstPart);
            input.firstPart = input.sencondPart;
            input.sencondPart = {
                "leftSpace": 470,
                "content": ''
            };
        }
    }
    return input;
}

/**
 * Generate text content to merge into page content
 * @param string text: text content
 * @param array firstPart: first part to calculate to add into page content
 * @param array sencondPart: sencond part to calculate to add into page content if the first is shoter than page height
 * @return array firstPart and sencondPart info to cut next page
 */
var generateTextContent = (text, firstPart, sencondPart) => {
    if (!text) return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    };
    var content1 = '';
    var content2 = '';

    var itemList = text.split('<p>');
    var itemtCount = itemList.length;
    for (var i = 0; i < itemtCount; i++) {
        var height = parseInt(itemList[i].split(' ').length/15);
        if (parseInt(itemList[i].split(' ').length%15) > 0) {
            height++;
        }
        // Calculate for each row
        height = height*24;
        if (i==0 || sencondPart.leftSpace == 470) height += 16;
        if (firstPart.leftSpace > height) {
            content1 += itemList[i]
            firstPart.leftSpace -= height;
        } else {
            // At the first time add content2
            if (content2.length == 0) {
                firstPart.leftSpace = 0;
            }
            sencondPart.leftSpace -= height;
            content2 += itemList[i];
        }
    }
    firstPart.content += getAnswerContentHtml(content1);
    sencondPart.content += getAnswerContentHtml(content2);
    return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    }
}

/**
 * Generate images content to merge into page content
 * @param array images: images content
 * @param array firstPart: first part to calculate to add into page content
 * @param array sencondPart: sencond part to calculate to add into page content if the first is shoter than page height
 * @return array firstPart and sencondPart info to cut next page
 */
var generateImagesContent = (images, firstPart, sencondPart) => {
    if (!images) return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    };
    var content1 = '';
    var content2 = '';
    var itemtCount = images.length;
    for (var i = 0; i < itemtCount; i += 3) {
        // Calculate for each row
        if (firstPart.leftSpace > 161) {
            content1 += getImageBoxtHtml(images[i].url);
            if (images[i+1]) content1 += getImageBoxtHtml(images[i+1].url);
            if (images[i+2]) content1 += getImageBoxtHtml(images[i+2].url);
            firstPart.leftSpace -= 161;
        } else {
            // At the first time add content2
            if (content2.length == 0) {
                firstPart.leftSpace = 0;
            }
            sencondPart.leftSpace -= 161;
            content2 += getImageBoxtHtml(images[i].url);
            if (images[i+1]) content2 += getImageBoxtHtml(images[i+1].url);
            if (images[i+2]) content2 += getImageBoxtHtml(images[i+2].url);
        }
    }
    firstPart.content += getFileListtHtml(content1);
    sencondPart.content += getFileListtHtml(content2);
    return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    }
}

/**
 * Generate pdfs content to merge into page content
 * @param array pdfs: pdfs content
 * @param array firstPart: first part to calculate to add into page content
 * @param array sencondPart: sencond part to calculate to add into page content if the first is shoter than page height
 * @return array firstPart and sencondPart info to cut next page
 */
var generateFilesContent = (hostname, pdfs, firstPart, sencondPart) => {
    if (!pdfs) return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    };
    var content1 = '';
    var content2 = '';
    var itemtCount = pdfs.length;
    for (var i = 0; i < itemtCount; i += 3) {
        // Calculate for each row
        if (firstPart.leftSpace > 73) {
            content1 += getFileBoxtHtml(hostname, pdfs[i].name);
            if (pdfs[i+1]) content1 += getFileBoxtHtml(hostname, pdfs[i+1].name);
            if (pdfs[i+2]) content1 += getFileBoxtHtml(hostname, pdfs[i+2].name);
            firstPart.leftSpace -= 73;
        } else {
            // At the first time add content2
            if (content2.length == 0) {
                firstPart.leftSpace = 0;
            }
            sencondPart.leftSpace -= 73;
            content2 += getFileBoxtHtml(hostname, pdfs[i].name);
            if (pdfs[i+1]) content2 += getFileBoxtHtml(hostname, pdfs[i+1].name);
            if (pdfs[i+2]) content2 += getFileBoxtHtml(hostname, pdfs[i+2].name);
        }
    }
    firstPart.content += getFileListtHtml(content1);
    sencondPart.content += getFileListtHtml(content2);
    return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    }
}

/**
 * Generate general info content to merge into page content
 * @param array info: general info content
 * @param array firstPart: first part to calculate to add into page content
 * @param array sencondPart: sencond part to calculate to add into page content if the first is shoter than page height
 * @return array firstPart and sencondPart info to cut next page
 */
var generateInfoContent = (info, firstPart, sencondPart) => {
    var content1 = '';
    var content2 = '';
    // Calculate for each row
    if (firstPart.leftSpace > 174) {
        content1 += getInfoBoxtHtml(info.deploymentDate, info.budget, info.name, info.email, info.phone);
        firstPart.leftSpace -= 174;
    } else {
        // At the first time add content2
        if (content2.length == 0) {
            firstPart.leftSpace = 0;
        }
        sencondPart.leftSpace -= height;
        content2 += getInfoBoxtHtml(info.deploymentDate, info.budget, info.name, info.email, info.phone)
    }
    firstPart.content += content1;
    sencondPart.content += content2;
    return {
        "firstPart": firstPart,
        "sencondPart": sencondPart
    }
}

/**
 * Calculate text height
 * @param string text:text content
 * @return number height of text
 */
var textHeight = (text) => {
    if (!text) return 0;
    var height = 0;
    var itemList = text.split('<p>');
    var itemCount = itemList.length - 1;

    for (var i = 0; i < itemCount; i++) {
        height += parseInt(itemList[i].split(' ').length/15);
        if (parseInt(itemList[i].split(' ').length%15) > 0) {
            height++;
        }
    }
    return height*24 + 16;
}

/**
 * Calculate image box height
 * @param array images: images content
 * @return number height of image box
 */
var imageBoxHeight = (images) => {
    var height = 0;
    if (!images) return 0;
    var len = images.length;
    if (len > 0) {
        height += parseInt(len/3);
        if (parseInt(len%3) > 0) {
            height++;
        }
    }
    return height*161;
}

/**
 * Calculate pdf box height
 * @param array pdfs: pdfs content
 * @return number height of pdf box
 */
var pdfBoxHeight = (pdfs) => {
    var height = 0;
    if (!pdfs) return 0;
    var len = pdfs.length;
    if (len > 0) {
        height += parseInt(len/3);
        if (parseInt(len%3) > 0) {
            height++;
        }
    }
    // line height: 73
    return height*73;
}

/**
 * Get template Html for pdf file
 * @return string template: html template
 */
const getTemplateHtml = async () => {
    try {
        const template = path.resolve("./templates/pdf_template.html");
        return await readFile(template, 'utf8');
    } catch (err) {
        return Promise.reject("Loading template is fail");
    }
}

/**
 * Get Answer Page Template Html
 * @param string subTitle: subTitle
 * @param string pageContent: page Content
 * @param number pageNumber: page Number
 * @return string template: html template
 */
const getAnswerPageHtml = (subTitle, pageContent, pageNumber) => {
    const template = 
    '<div class="box">' +
        '<div class="eslipse1"></div>' +
        '<div class="eslipse2"></div>' +
        '<div class="eslipse3"></div>' +
        '<div class="rectango">' +
            '<div class="page-content question">' +
                '<div class="sub-title">' + subTitle + '</div>' +
                pageContent +
                '<div class="page_number">' + pageNumber + '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    return template;
}

/**
 * Get Answer Title Html
 * @param string title: title
 * @return string template: html template
 */
const getAnswerTitleHtml = (title) => {
    const template = 
    '<div class="title">' +
        '<div class="background"></div>' +
        '<div class="text">' + title + '</div>' +
    '</div>';
    return template;
}

/**
 * Get Answer Content Template Html
 * @param string content: content
 * @return string template: html template
 */
const getAnswerContentHtml = (content) => {
    const template = 
    '<div class="content">' +
        content +
    '</div>';
    return template;
}

/**
 * Get File List Template Html
 * @param string content: content
 * @return string template: html template
 */
const getFileListtHtml = (content) => {
    const template = 
    '<div class="file-list">' +
        content +
    '</div>';
    return template;
}

/**
 * Get Image Box Template Html
 * @param string url: image url
 * @return string template: html template
 */
const getImageBoxtHtml = (url) => {
    const template = 
    '<div class="image-box">' +
        '<img src="' + url + '" >' + 
    '</div>';
    return template;
}

/**
 * Get File Box Template Html
 * @param string filename: filename
 * @return string template: html template
 */
const getFileBoxtHtml = (hostname, filename) => {
    var template = 
    '<div class="file-box">' +
        '<img class="file-icon" src="' + hostname + '/images/file.svg" >' + 
        '<div class="file-name">';
    template += filename;
    template += '</div>' +
    '</div>';
    return template;
}

/**
 * Get Info Box Template Html
 * @param string deploymentDate: deployment Date
 * @param string budget: budget
 * @param string name: name
 * @param string email: email
 * @param string phone: phone
 * @return string template: html template
 */
const getInfoBoxtHtml = (deploymentDate, budget, name, email, phone) => {
    if (!budget) {
        budget = '0€'
    }
    const template = 
    '<div class="infomation">' +
        '<div class="info-left">' + 
            '<div class="label">Expected delivery :</div>' + 
            '<div class="content">' + deploymentDate + '</div>' + 
            '<div class="label">Budget Maximum :</div>' + 
            '<div class="content">' + budget + '</div>' + 
        '</div>' + 
        '<div class="info-right">' + 
            '<div class="label">Receiver :</div>' + 
            '<div class="content">' + name + '</div>' + 
            '<div class="content">' + email + '</div>' + 
            '<div class="content">' + phone + '</div>' + 
        '</div>' +
    '</div>';
    return template;
}
module.exports = pdfGenerator