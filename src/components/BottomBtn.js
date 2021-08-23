import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

BottomBtn.propTypes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    icon:PropTypes.object.isRequired,
    onBtnClick:PropTypes.func
}
BottomBtn.defaultProps={
    text:'新建'
}

export default function BottomBtn({text,colorClass,onBtnClick,icon}) {
    return (
       <button type="button" style={{width:100+'%'}} onClick={onBtnClick} className={`btn btn-block no-border ${colorClass}`}>
           <FontAwesomeIcon  style={{marginRight:1+'vw'}} size="lg" icon={icon} />
           {text}
       </button>
    )
}
