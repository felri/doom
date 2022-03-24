import React, { useEffect, useRef, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import UserContext from '../../context/user'
import Input from '../../components/Input'
import { makeId } from '../../utils/helpers'
import { getClient } from '../../zomes'

export default function Home() {
  const history = useHistory()
  const { user } = useContext(UserContext)

  const [room, setRoom] = useState(makeId(10))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [holochain, setHolochain] = useState(null)

  async function getHolochainClient() {
    const { client, cellId, unsubscribe } = await getClient({
      callback: () => {},
    })
    setHolochain({ client, cellId, unsubscribe })
  }

  useEffect(() => {
    if (!user.profile.nickname) history.goBack()
    getHolochainClient()
    return () => {
      if (holochain) holochain.unsubscribe()
    }
  }, [])

  const joinRoom = async ({ id = room }) => {
    const result = await holochain.client.callZome(
      holochain.cellId,
      'peers',
      'join_room_with_code',
      {
        roomcode: id,
        nickname: user.profile.nickname,
      }
    )
    if (result) {
      setRoom(id)
      history.push('/room/' + id)
    } else {
      setError(true)
      setLoading(false)
    }
  }

  const onCreateRoom = async () => {
    setLoading(true)
    const result = await holochain.client.callZome(
      holochain.cellId,
      'peers',
      'create_room_code_anchor',
      room
    )
    if (result) {
      setError(false)
      setLoading(false)
      joinRoom({ id: room })
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div>
      <Input onChange={setRoom} value={room} />
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={onCreateRoom}>Create Room</button>
      <button onClick={() => history.goBack()}>goBack</button>
    </div>
  )
}
