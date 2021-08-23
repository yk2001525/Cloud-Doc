import "./App.css";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import defaultFiles from "./utils/defaultFiles";
import BottomBtn from "./components/BottomBtn";
import TabList from "./components/TabList";
import { faPlus, faFileImport } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [files, setFiles] = useState(defaultFiles);
  const [activeFileID, setActiveFileID] = useState("");
  //指代当前有哪些已经打开的文件
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  //未保存文件
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const openedFiles = openedFileIDs.map((openID) => {
    return files.find((file) => file.id === openID);
  });
  const fileClick = (fileID) => {
    setActiveFileID(fileID);
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID]);
    }
  };
  const tabClick = (fileID)=>{
    setActiveFileID(fileID)
  }
  const tabClose = (id)=>{
    //remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    //set the active to the first opened tab if still tabs left
    if(tabsWithout.length>0){
      setActiveFileID(tabsWithout[0])

    }else{
      setActiveFileID('')
    }
  }
  const fileChange = (id,value)=>{
    console.log(id,value)
    //loop through file array to update to new value
    const newFiles = files.map(file=>{
      if(file.id === id){
        file.body = value
      }
      return file
    })
    setFiles(newFiles)
    // update unsavedIDs
    // console.log(id,value)
    if(!unsavedFileIDs.includes(id)){
      setUnsavedFileIDs([ ...unsavedFileIDs, id])
    }
  }
  const activeFile = files.find((file) => file.id === activeFileID);
  return (
    <div className="App container-fluid px-0">
      <div className="row g-0">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={(value) => {
              console.log(value);
            }}
          ></FileSearch>
          <FileList
            files={files}
            onFileClick={fileClick}
            onFileDelete={(id) => {
              console.log(id);
            }}
            onSaveEdit={(id, newValue) => {
              console.log(id, newValue);
            }}
          ></FileList>
          <div className="row g-0 button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
              ></BottomBtn>
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
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
                onChange={
                  (value)=>{
                    fileChange(activeFile.id,value)
                  }
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
