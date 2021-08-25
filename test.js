const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
var accessKey = 'E8JoY4Wd0sB1APAjBlaFXxFAGDexsGPl-BPLufxQ';
var secretKey = 'SPkWllNhdQy-grScPxnSLT-6IV6n-RXUtWotKURm';
var localFile = "/Users/yangke/Documents/React-Electron笔记.md";
var key='React.md';
const manager = new QiniuManager(accessKey,secretKey,'y1272689242')
// manager.uploadFile(key,localFile).then((data)=>{
//     console.log('上传成功',data)
//     return manager.deleteFile(key)
// }).then((data)=>{
//     console.error('删除成功')
// })

// var publicBucketDomain = 'http://qye0km3c5.hd-bkt.clouddn.com';
// manager.generateDownloadLink(key).then(data=>{
//     console.log(data)
// })
const downloadPath = path.join(__dirname,key)
manager.downloadFile(key,downloadPath).then(()=>{
    console.log('下载写入文件完毕')
})