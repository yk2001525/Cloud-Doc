const {app,BrowserWindow,Menu,ipcMain,dialog} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const fileStore = new Store({name:'Files Data'})
const settingsStore = new Store({ name: 'Settings'})
let mainWindow,settingsWindow

const createManager=()=>{
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey,secretKey,bucketName)


}
app.on('ready',()=>{
    const mainWindowConfig = {
        width: 1440,
        height: 768
    }
    const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
    mainWindow = new AppWindow(mainWindowConfig,urlLocation)
    mainWindow.on('closed',()=>{
        mainWindow = null
    })

    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    //hook events
    ipcMain.on('open-settings-window',()=>{
        const settingsWindowConfig = {
            width:500,
            height:400,
            parent:mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname,'./settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.removeMenu()
        settingsWindow.on('closed',()=>{
            settingsWindow = null
        })
    })
    ipcMain.on('upload-file',(event,data)=>{
        const manager = createManager()
        manager.uploadFile(data.key,data.path).then(data=>{
            console.log('上传成功',data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(()=>{
            dialog.showErrorBox('同步失败','请检查七牛云参数是否正确')
        })
    })
    ipcMain.on('download-file',(event,data)=>{
        const manager = createManager()
        const filesObj = fileStore.get('files')
        const {key,path,id} = data
        manager.getStat(data.key).then((res)=>{
            const serverUpdatedTime = Math.round(res.putTime / 10000)
            const localUpdatedTime = filesObj[id].updatedAt
            if(serverUpdatedTime > localUpdatedTime || !localUpdatedTime){
                console.log('new file')
                manager.downloadFile(key,path).then(()=>{
                    mainWindow.webContents.send('file-downloaded',{status:'download-success',id})
                })
            }else{
                console.log('no new file')
                mainWindow.webContents.send('file-downloaded',{status:'no-new-file',id})
            }
        },(error)=>{
            if(error.statusCode === 612){
                mainWindow.webContents.send('file-downloaded',{status:'no-file',id})
            }
        })

    })
    ipcMain.on('config-is-saved',()=>{
        let qinuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
        const switchItems = (toggle)=>{
            [1,2,3].forEach(number=>{
                qinuMenu.submenu.items[number].enabled = toggle
            })
        }
        const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
        if(qiniuIsConfiged){
            switchItems(true)
        }else{
            switchItems(false)
        }

    })

})