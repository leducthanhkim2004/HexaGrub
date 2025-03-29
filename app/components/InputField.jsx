"use client";
import { useState } from "react";
import React from "react";
import '../login/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import visibility icons

const InputField = ({ type, placeholder, icon }) => {
    // State to toggle password visibility
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    return (
      <div className="input-wrapper">
        <input
          type={isPasswordShown ? 'text' : type}
          placeholder={placeholder}
          className="input-field"
          required
        />
        {icon && <FontAwesomeIcon icon={icon} className="input-icon" />}
        {type === 'password' && (
          <FontAwesomeIcon
            icon={isPasswordShown ? faEye : faEyeSlash}
            onClick={() => setIsPasswordShown(prevState => !prevState)}
            className="eye-icon"
          />
        )}
      </div>
    )
  }
  export default InputField;
