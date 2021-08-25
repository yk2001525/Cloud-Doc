import "./App.css";
import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SimpleMDE from "react-simplemde-editor";
import uuidv4 from "uuid/dist/v4";
import { flattenArr, objToArr,timestampToString } from "./utils/helper";
import fileHelper from "./utils/fileHelper";
import "easymde/dist/easymde.min.css";
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";

import BottomBtn from "./components/BottomBtn";
import TabList from "./components/TabList";
import Loader from "./components/Loader";
import useIpcRenderer from "./utils/useIpcRenderer";
import { faPlus, faFileImport,faSave } from "@fortawesome/free-solid-svg-icons";

//require node.js modules
const { join,basename,extname,dirname } = window.require("path");
const { remote,ipcRenderer } = window.require("electron");
const Store = window.require('electron-store')

const fileStore = new Store({'name':'Files Data'})
const settingsStore = new Store({'name':'Settings'})
const getAutoSync = ()=> ['accessKey', 'secretKey', 'bucketName','enableAutoSync'].every(key => !!settingsStore.get(key))

const saveFilesToStore = (files)=>{
  //we don't have to store any info in file system, eg: isNew,body,etc
  const filesStoreObj = objToArr(files).reduce((result,file)=>{
    const {id,path,title,createdAt,isSynced,updatedAt} = file
    result[id]={
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt
    }
    return result
  },{})
  fileStore.set('files',filesStoreObj)
}

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const [activeFileID, setActiveFileID] = useState("");
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);
  const [isLoading,setLoading] = useState(false)
  const filesArr = objToArr(files);

  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath("desktop");

  const activeFile = files[activeFileID];
  const openedFiles = openedFileIDs.map((openID) => {
    return files[openID];
  });
  const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr;

  const fileClick = (fileID) => {

    setActiveFileID(fileID);
    const currentFile = files[fileID]
    const { id,title,path,isLoaded} = currentFile

    if(!currentFile.isLoaded){
      if(getAutoSync()){
        ipcRenderer.send('download-file',{
          key:`${title}.md`,
          path,
          id
        })
      }else{
        fileHelper.readFile(currentFile.path).then(value=>{
          const newFile = {...files[fileID],body:value,isLoaded:true}
          setFiles({...files,[fileID]:newFile})
        })
      }
     
    }
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID]);
    }
  };
  const tabClick = (fileID) => {
    setActiveFileID(fileID);
  };
  const tabClose = (id) => {
    //remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter((fileID) => fileID !== id);
    setOpenedFileIDs(tabsWithout);
    //set the active to the first opened tab if still tabs left
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0]);
    } else {
      setActiveFileID("");
    }
  };
  const fileChange = (id, value) => {
    if(value !== files[id].body){ 
      console.log(value,files[id].body)
      const newFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: newFile });
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id]);
      }
    }

  };
  const deleteFile = (id) => {
    if(files[id].isNew){
      const {[id]:value,...afterDelete} = files
      setFiles(afterDelete);
    }else{
      fileHelper.deleteFile(files[id].path).then(()=>{
        const {[id]:value,...afterDelete} = files
        setFiles(afterDelete);
        saveFilesToStore(afterDelete)
        // close the tab if opened
        tabClose(id);
      })
    }

  
  
  };
  const updateFileName = (id, title, isNew) => {
    const newPath = isNew? join(savedLocation, `${title}.md`) : join(dirname(files[id].path),`${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false,path:newPath };
    const newFiles = { ...files, [id]: modifiedFile }
    if (isNew) {
      fileHelper
        .writeFile(newPath, files[id].body)
        .then(() => {
          setFiles(newFiles);
          saveFilesToStore(newFiles)
        });
    } else {
      const oldPath = files[id].path
      fileHelper
        .renameFile(
          oldPath,
          newPath
        )
        .then(() => {
          setFiles(newFiles);
          saveFilesToStore(newFiles)
        });
    }
  };
  const fileSearch = (keyword) => {
    //filter out the new files based on the keyword
    const newFiles = filesArr.filter((file) => file.title.includes(keyword));
    setSearchedFiles(newFiles);
  };
  const createNewFile = () => {
    const newID = uuidv4();
    const newFile = {
      id: newID,
      title: "",
      body: "## 请输入Markdown",
      createdAt: new Date().getTime(),
      isNew: true,
    };
    setFiles({ ...files, [newID]: newFile });
  };
  const saveCurrentFile = ()=>{

    if(activeFile){
      const {path,body,title} = activeFile
    fileHelper.writeFile(path,
    body
    ).then(()=>{
      setUnsavedFileIDs(unsavedFileIDs.filter(id=>id!==activeFile.id))
      if(getAutoSync()){
        ipcRenderer.send('upload-file',{
          key:`${title}.md`,
          path
        })
      }
    })
    }

  }
  const importFiles=()=>{
    remote.dialog.showOpenDialog({
      title:"选择导入的 Markdown 文件",
      properties:['openFile','multiSelections'],
      filters:[
        {
          name:'Markdown files',extensions:['md']
        }
      ]
    }).then((paths)=>{
      console.log(paths.filePaths)
      
      const filteredPaths = paths.filePaths.filter(path=>{
        const alreadyAdded = Object.values(files).find(file=>{
          return file.path===path
        })
        return !alreadyAdded
      })

      const importFilesArr = filteredPaths.map(path=>{
        return{
          id:uuidv4(),
          title:basename(path,extname(path)),
          path
        }
      })
      const newFiles = {...files,...flattenArr(importFilesArr)}
      setFiles(newFiles)
      saveFilesToStore(newFiles)
      if(importFilesArr.length>0){
        remote.dialog.showMessageBox({
          type:'info',
          title:`成功导入了${importFilesArr.length}个文件`,
          message:`成功导入了${importFilesArr.length}个文件`
        })
      }
    })
  }
  const activeFileUploaded =()=>{
    const {id} = activeFile
    const modifiedFile = {...files[id],isSynced:true,updatedAt:new Date().getTime()}
    const newFiles = {...files,[id]:modifiedFile}
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }
  const activeFileDownloaded = (event,message)=>{
    const currentFile = files[message.id]
    const {id,path} = currentFile
    fileHelper.readFile(path).then(value=>{
      let newFile
      if(message.status === 'download-success'){
        newFile = {...files[id],body:value,isLoaded:true,isSynced:true,updatedAt:new Date().getTime()}
      }else{
        newFile = {...files[id],body:value,isLoaded:true}
      }
      const newFiles = {...files,[id]:newFile}
      setFiles(newFiles)
      saveFilesToStore(newFiles)

    })
  }
  const filesUploaded = ()=>{
    const newFiles = objToArr(files).reduce((result,file)=>{
      const currentTime = new Date().getTime()
      result[file.id]={
        ...files[file.id],
        isSynced:true,
        updatedAt:currentTime
      }
      return result
    },{})
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }
  useIpcRenderer({
    'create-new-file':createNewFile,
    'import-file':importFiles,
    'save-edit-file':saveCurrentFile,
    'active-file-uploaded':activeFileUploaded,
    'file-downloaded':activeFileDownloaded,
    'loading-status':(message,status)=>{setLoading(status)},
    'files-uploaded':filesUploaded
  })
  return (
    <div className="App container-fluid px-0">
     {
       isLoading &&
       <Loader/>
     } 
      <div className="row g-0">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            title="My Document"
            onFileSearch={fileSearch}
          ></FileSearch>
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          ></FileList>
          <div className="row g-0 button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                onBtnClick={createNewFile}
                icon={faPlus}
              ></BottomBtn>
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              ></BottomBtn>
            </div>
          </div>
        </div>
        <div className="col-9  right-panel">
          {!activeFile && (
            <div className="start-page"> 选择或者创建新的Markdown文档</div>
          )}
          {activeFile && (
            <>
              <TabList
                onCloseTab={tabClose}
                unsaveIds={unsavedFileIDs}
                files={openedFiles}
                activeId={activeFileID}
                onTabClick={tabClick}
              ></TabList>
              <SimpleMDE
                key={activeFile && activeFile.id}
                options={{
                  minHeight: "515px",
                }}
                value={activeFile && activeFile.body}
                // onChange={(value) => {
                //   fileChange(activeFile.id,value)
                // }}
                onChange={(value) => {
                  fileChange(activeFile.id, value);
                }}
              />
              {activeFile.isSynced && 
                <span className="sync-status">
                  已同步，上次同步时间{timestampToString(activeFile.updatedAt)}
                </span>
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
