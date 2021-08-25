const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')
class QiniuManager {
    constructor(accessKey,secretKey,bucket){
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }
    uploadFile(key,localFilePath){

        var options = {
            scope: this.bucket + ":" + key,
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(this.mac);
        var formUploader = new qiniu.form_up.FormUploader(this.config)
        var putExtra = new qiniu.form_up.PutExtra()
        // 文件上传
        return new Promise((resolve,reject)=>{
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve,reject));
        })
       

    }
    deleteFile(key){
        return new Promise((resolve,reject)=>{
            this.bucketManager.delete(this.bucket,key,this._handleCallback(resolve,reject))
        })
  }
  getBucketDomain(){
      const reqUrl = `http://uc.qbox.me/v2/domains?tbl=${this.bucket}`
      const digest = qiniu.util.generateAccessToken(this.mac,reqUrl)
      return new Promise((resolve,reject)=>{
          qiniu.rpc.postWithoutForm(reqUrl,digest,this._handleCallback(resolve,reject))
      })
  }
  getStat(key){
      return new Promise((resolve,reject)=>{
          this.bucketManager.stat(this.bucket,key,this._handleCallback(resolve,reject))
      })
  }
  generateDownloadLink(key){
    //   this.getBucketDomain().then()
    const domainPromise = this.publicBucketDomain ? Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
    return domainPromise.then(data=>{
        if(Array.isArray(data)&&data.length>0){
            const pattern = /^https?/
            this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
            return this.bucketManager.publicDownloadUrl(this.publicBucketDomain,key)
        }else{
            throw Error('域名未找到，请查看储存空间是否已经过期')
        }
    })
}
    downloadFile(key,downloadPath){
        //step 1 get the download link
        //step 2 send the request to download link ,return ad readable stream
        //step 3 create a writable stream and pipe to id
        //step 4 return a promise based result
       return this.generateDownloadLink(key).then(link=>{
            const timeStamp = new Date().getTime()
            const url = `${link}?timestamp=${timeStamp}`
            return axios({
                url,
                method:'GET',
                responseType:'stream',
                headers:{'Cache-Control':'no-cache'}
            }).then(response=>{
                const writer = fs.createWriteStream(downloadPath)
                response.data.pipe(writer)
                return new Promise((resolve,reject)=>{
                    writer.on('finish',resolve)
                    writer.on('error',reject)
                })

            })
        }).catch(err =>{
            return Promise.reject({err:err.response})
        })
    }
  _handleCallback(resolve,reject){
      return(respErr, respBody, respInfo)=>{
        if (respErr) {
            throw respErr;
          }
          if (respInfo.statusCode == 200) {
              resolve(respBody)
          //   console.log(respBody);
          } else {
              reject({
                  statusCode:respInfo.statusCode,
                  body:respBody
              })
          }
      }
   
  }

}
module.exports = QiniuManager