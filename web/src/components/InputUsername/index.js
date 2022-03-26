import React, { useEffect, useState } from 'react'
import Input from '../Input'
import Button from '../Button'

export default function InputUsername({ onLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  const handleEnter = () => {
    if ((username, length >= 3)) {
      setError(true)
      return
    }
    setError(false)
    setUsername(username)
    onLogin({ username, email })
  }

  return (
    <>
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
      <Button onClick={handleEnter}>GO</Button>
    </>
  )
}
