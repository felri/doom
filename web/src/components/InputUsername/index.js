import React, { useEffect, useState } from 'react'
import Input from '../Input'

export default function InputUsername({onLogin}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  const handleEnter = () => {
    if (username,length >= 3) {
      setError(true)
      return
    }
    setError(false)
    setUsername(username)
    onLogin({username, email})
  }

  return (
    <div>
      <Input
        value={username}
        onChange={setUsername}
        onEnter={handleEnter}
        error={error}
        label="user"
      />
      <Input
        value={email}
        onChange={setEmail}
        onEnter={handleEnter}
        label="email"
        error={false}
      />
    </div>
  )
}
