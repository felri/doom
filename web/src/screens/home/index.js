import React, { useEffect, useRef, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import UserContext from '../../context/user'
import Input from '../../components/Input'
import { makeId } from '../../utils/helpers'
import { getClient } from '../../zomes'
import Container from '../../components/Container'
import Button from '../../components/Button'
import './styles.css'

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  )
}

const Content = ({ room, onClick, onChange, text }) => (
  <div className="content">
    <Input onChange={onChange} value={room} />
    <Button onClick={onClick}>{text}</Button>
  </div>
)

export default function Home() {
  const history = useHistory()
  const { user } = useContext(UserContext)

  const [room, setRoom] = useState(makeId(10))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [holochain, setHolochain] = useState(null)
  const [activeTab, setActiveTab] = useState('Create')
  const [tabs, setTabs] = useState(['Create', 'Join'])

  async function getHolochainClient() {
    const { client, cellId, unsubscribe } = await getClient({
      callback: () => {},
    })
    setHolochain({ client, cellId, unsubscribe })
  }

  useEffect(() => {
    if(activeTab === 'Join') setRoom('')
    else setRoom(makeId(10))
  },[activeTab])

  useEffect(() => {
    if (!user.profile.nickname) history.goBack()
    getHolochainClient()
    return () => {
      if (holochain) holochain.unsubscribe()
    }
  }, [])

  const onJoinRoom = async ({ id = room }) => {
    if(!holochain) return
    if(!id) return setError('Room id is required')
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
    if(!holochain) return
    if(!room) return setError('Room id is required')
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
      onJoinRoom({ id: room })
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="container-options-home">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'Create' && (
          <Content
            room={room}
            onClick={onCreateRoom}
            text={activeTab}
            onChange={setRoom}
          />
        )}
        {activeTab === 'Join' && (
          <Content
            room={room}
            onClick={onJoinRoom}
            text={activeTab}
            onChange={setRoom}
          />
        )}
      </div>
    </Container>
  )
}
