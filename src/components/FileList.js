import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash,faTimes } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import PropTypes from "prop-types";
import useKeyPress from '../hooks/useKeyPress'

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
};

export default function FileList({
  files,
  onFileClick,
  onSaveEdit,
  onFileDelete,
}) {
    const [editStates,setEditStates] = useState(false)
    const [value,setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const closeSearch = ()=>{
        setEditStates(false)
        setValue('')
    }
    useEffect(()=>{
        if(enterPressed && editStates){
            const editItem = files.find(file=>file.id === editStates)
                    onSaveEdit(editItem.id,value)
                    setEditStates(false)
                    setValue('')
        }
        if(escPressed && editStates){
              closeSearch()
        }
    })
  return (
    <ul className="list-group list-group-flush file-list">
      {files.map((file) => (
        <li 
          className="list-group-item row bg-light d-flex align-items-center file-item"
          key={file.id}
        >
            {   (file.id !== editStates) && 
            <>
                  <span className="col-2">
                  <FontAwesomeIcon size="lg" icon={faMarkdown} />
                </span>
                <span
                  onClick={()=>{onFileClick(file.id)}}
                className="col-8 c-link">{file.title}</span>
                <button
                  type="button"
                  className="icon-button col-1"
                  onClick={() => {setEditStates(file.id);setValue(file.title)}}
                >
                  <FontAwesomeIcon title="编辑" size="lg" icon={faEdit} />
                </button>
                <button
                  type="button"
                  className="icon-button col-1"
                  onClick={() => {onFileDelete(file.id)}}
                >
                  <FontAwesomeIcon title="删除" size="lg" icon={faTrash} />
                </button>
                </>

                  
            }
            {
                (file.id === editStates) && 
                <>
                <input
                style={{width:83+'%'}}
                  className="form-control col-10"
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  value={value}
                />
                <button
                  type="button"
                  className="icon-button col-2"
                  onClick={closeSearch}
                >
                  <FontAwesomeIcon title="关闭" size="lg" icon={faTimes}/>
                </button>
              </>
            }
        
        </li>
      ))}
    </ul>
  );
}
