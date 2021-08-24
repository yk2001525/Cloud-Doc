import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash,faTimes } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import PropTypes from "prop-types";
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from "../hooks/useContextMenu";
import { getParentNode } from "../utils/helper";

//require node.js modules
// const { join,basename,extname,dirname } = window.require("path");
const { remote } = window.require("electron");
const { Menu,MenuItem } = remote

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
    let node = useRef(null)
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const closeSearch = (editItem)=>{
        setEditStates(false)
        setValue('')
        //if we are editing a newly created file,we should delete this file when pressing esc
        if(editItem.isNew){
            onFileDelete(editItem.id)
        }
    }
 const clickedItem = useContextMenu([
        {
            label:'打开',
            click:()=>{
                const parentElement = getParentNode(clickedItem.current,'file-item')
                if(parentElement){
                    onFileClick(parentElement.dataset.id)
                }
            }
        },
        {
            label:'重命名',
            click:()=>{
                const parentElement = getParentNode(clickedItem.current,'file-item')
                if(parentElement){
                    const { id, title } = parentElement.dataset
                    setEditStates(id)
                    setValue(title)
                }
            }
        },
        {
            label:'删除',
            click:()=>{
                const parentElement = getParentNode(clickedItem.current,'file-item')
                if(parentElement){
                    onFileDelete(parentElement.dataset.id)
                }
            }
        }
        
    ],'.file-list',[files])
    useEffect(()=>{ 
        const editItem = files.find(file=>file.id === editStates)
        if(enterPressed && editStates && value.trim()!== ''){
                    onSaveEdit(editItem.id,value,editItem.isNew)
                    setEditStates(false)
                    setValue('')
        }
        if(escPressed && editStates){
              closeSearch(editItem)
        }
    })
    useEffect(()=>{
        const newFile = files.find(file=>file.isNew)
        // console.log(newFile)
        if(newFile){
            setEditStates(newFile.id)
            setValue(newFile.title)
        }
    },[files])
    useEffect(()=>{
        if(editStates){
            node.current.focus()
        }
    })
  return (
    <ul className="list-group list-group-flush file-list">
      {files.map((file) => (
        <li 
          className="list-group-item row bg-light d-flex align-items-center file-item mx-0"
          key={file.id}
          data-id={file.id}
          data-title={file.title}
        >
            {   (file.id !== editStates && !file.isNew) && 
            <>
                  <span className="col-2">
                  <FontAwesomeIcon size="lg" icon={faMarkdown} />
                </span>
                <span
                  onClick={()=>{onFileClick(file.id)}}
                className="col-6 c-link">{file.title}</span>
                <button
                  type="button"
                  className="icon-button col-2"
                  onClick={() => {setEditStates(file.id);setValue(file.title)}}
                >
                  <FontAwesomeIcon title="编辑" size="lg" icon={faEdit} />
                </button>
                <button
                  type="button"
                  className="icon-button col-2"
                  onClick={() => {onFileDelete(file.id)}}
                >
                  <FontAwesomeIcon title="删除" size="lg" icon={faTrash} />
                </button>
                </>

                  
            }
            {
                ((file.id === editStates) || file.isNew) && 
                <>
                <input
                style={{width:83+'%'}}
                  className="form-control col-10"
                  ref={node}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  value={value}
                  placeholder="请输入文件名称"
                />
                <button
                  type="button"
                  className="icon-button col-2"
                  onClick={()=>{closeSearch(file)}}
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
