import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import defaultFiles from "./utils/defaultFiles";
import BottomBtn from "./components/BottomBtn";

import { faPlus,faFileImport } from "@fortawesome/free-solid-svg-icons";

function App() {
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
            onFileClick={(id) => {
              console.log(id);
            }}
            onFileDelete={(id)=>{console.log(id)}}
            files={defaultFiles}
            onSaveEdit={(id,newValue)=>{console.log(id,newValue)}}
          ></FileList>
          <div className="row g-0">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} ></BottomBtn>
            </div>
            <div className="col">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport}></BottomBtn>
            </div>
          </div>
        </div>
        <div className="col-9 bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
