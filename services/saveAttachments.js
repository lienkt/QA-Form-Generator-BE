/**
 * Save Attachments
 * @author: lienkt
 */

 "use strict";
const fs = require('fs');
var archiver = require('archiver');

const saveAttachments = async (data) => {
    // Get pages for menu1 content:
    // 1. Client description
    saveMenuAttachments(data.projectName, 'Client description', data.answer2ImgList, data.answer2FileList)

    // Avata
    saveMenuAttachments(data.projectName, 'Avata', data.answer3FileList1, [])

    // Cover
    saveMenuAttachments(data.projectName, 'Cover', data.answer3FileList2, [])

    // 2. Skincare, makeup products
    saveMenuAttachments(data.projectName, 'Skincare, makeup products', data.answer4ImgList, data.answer4FileList)

    // 3. Perfumes
    saveMenuAttachments(data.projectName, 'Perfumes', data.answer5ImgList, data.answer5FileList)
    
    // 4. Clothes
    saveMenuAttachments(data.projectName, 'Clothes', data.answer6ImgList, data.answer6FileList)
    
    // 5. Shoes
    saveMenuAttachments(data.projectName, 'Shoes', data.answer7ImgList, data.answer7FileList)
    
    // 6. Bags
    saveMenuAttachments(data.projectName, 'Bags', data.answer8ImgList, data.answer8FileList)
    
    // Get pages for menu2 content:
    // 1. Foods
    saveMenuAttachments(data.projectName, 'Foods', data.answer9ImgList, data.answer9FileList)
    
    // 2. Previous order
    saveMenuAttachments(data.projectName, 'Previous order', [], data.answer10FileList)

    // Get pages for menu3 content:
    // 1. Questions
    saveMenuAttachments(data.projectName, 'Questions', data.answer11ImgList, data.answer11FileList)
    
    // 2. Requiments
    saveMenuAttachments(data.projectName, 'Requiments', data.answer12ImgList, data.answer12FileList)
    
    // 3. Expected deliverables
    saveMenuAttachments(data.projectName, 'Expected deliverables', data.answer13ImgList, data.answer13FileList)
    
    // 4. Delivery infomations
    saveMenuAttachments(data.projectName, 'Delivery infomations', data.answer17ImgList, data.answer17FileList)
    
    return zipAttachment(data.projectName)
}

const zipAttachment = (projectName) => {
    var dir = './projects/' + projectName + '/attachments'
    var newDir = './projects/' + projectName + '/'
    var fileName = projectName + '_attachments.zip'
    if (!fs.existsSync(dir)){
        return ''
    }

    var output = fs.createWriteStream(newDir + fileName)
    var archive = archiver('zip')

    output.on('close', function () {
        console.log('archiver has been finalized and the output file descriptor has closed.')
    })
    archive.on('error', function(err){
        throw err;
    });
    archive.pipe(output);
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(dir, false);
    
    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory(dir, newDir);
    archive.finalize();
    return fileName
}

const saveMenuAttachments = (projectName, dirName, imgList, fileList) => {
    // Create images directory:
    var dir = './projects/' + projectName + '/attachments/' + dirName + '/images/'
    if (imgList.length > 0 && !fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true })
        saveFileList(dir, imgList)
    }

    // Create pdfs directory:
    dir = './projects/' + projectName + '/attachments/' + dirName + '/pdfs/'
    if (fileList.length > 0 && !fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true })
        saveFileList(dir, fileList)
    }
}

const saveFileList = (dir, fileList) => {
    for (var i = 0; i < fileList.length; i++) {
        const data = new Buffer.from(fileList[i].data)
        fs.writeFile(dir + fileList[i].name, data, callback)
    }
}

var callback = (err) => {
    if (err) throw err;
    console.log('File saved!');
}
module.exports = saveAttachments