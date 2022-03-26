import React, { useEffect, useRef, useState, useContext } from 'react'
import InputUsername from '../../components/InputUsername'
import { useHistory } from 'react-router-dom'
import UserContext from '../../context/user'
import { getClient } from '../../zomes'
import Container from '../../components/Container'

export default function Login() {
  const history = useHistory()
  const { user, setUser } = useContext(UserContext)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [holochain, setHolochain] = useState(false)

  async function getHolochainClient() {
    const { client, cellId, unsubscribe } = await getClient({
      callback: () => {},
    })
    setHolochain({ client, cellId, unsubscribe })
  }

  const getProfile = async () => {
    const result = await holochain.client.callZome(
      holochain.cellId,
      'profiles',
      'get_my_profile',
      null
    )
    if (result) {
      setUser(result)
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user.profile.nickname) history.push('/home')
  }, [user])

  const onLogin = async ({ username, email }) => {
    setLoading(true)
    const result = await holochain.client.callZome(
      holochain.cellId,
      'profiles',
      'create_profile',
      {
        nickname: username,
        fields: { email: email },
      }
    )
    if (result) {
      setUser(result)
      setError(false)
      history.push('/home')
    } else {
      setError(true)

    }
  }

  useEffect(() => {
    getHolochainClient()
  }, [])

  useEffect(() => {
    if(holochain) getProfile()
    return () => {
      if (holochain) holochain.unsubscribe()
    }
  }, [holochain])

  return (
    <Container history={history}>
      <InputUsername onLogin={onLogin} />
    </Container>
  )
}
