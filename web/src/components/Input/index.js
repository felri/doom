import React from 'react'
import classNames from 'classnames'
import './styles.css'

const Input = ({ value, onChange, onEnter, error = false, label, type = "text" }) => (
  <div>
    <input
      className={classNames({ input: true, error: error })}
      type={type}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onEnter(e.target.value)
        }
      }}
    />
  </div>
)

export default Input
