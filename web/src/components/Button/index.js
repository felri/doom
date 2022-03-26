import React from 'react'
import './styles.css'

const Button = ({ children, onClick, type = 'confirm' }) => (
  <div className='button' onClick={onClick}>
    {children}
  </div>
)

export default Button
