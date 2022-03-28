import React from 'react'
import './styles.css'

const Back = ({ onClick }) => (
  <div className="back-arrow" onClick={onClick}>
    <svg
      stroke="white"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      version="1.1"
      viewBox="0 0 64 64"
      xmlSpace="preserve"
    >
      <path d="M40.2 58.3L37.3 55.7 56.5 34 0 34 0 30 56.5 30 37.3 8.3 40.2 5.7 63.7 32z"></path>
    </svg>
  </div>
)

export default Back
