import React from 'react'
import Button from '../../components/Button'
import './styles.css'

const Error = ({ message, onClick }) => (
  <div className="error-modal">
    <div className="error-container">
      <div className="error-message">{message}</div>
      <Button onClick={onClick}>OK</Button>
    </div>
  </div>
)

export default Error
