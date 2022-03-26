// Library Imports
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'

import Home from './screens/home'
import Room from './screens/room'
import Login from './screens/login'

import User from './context/user'
import './styles.css'

const App = () => {
  const [user, setUser] = useState({
    agentPubKey: '',
    profile: {
      nickname: '',
      fields: {},
    },
  })

  return (
    <Router>
      <User.Provider value={{ user, setUser }}>
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/room/:id">
            <Room />
          </Route>
          <Route
            path="*"
            element={
              <main style={{ padding: '1rem' }}>
                <p>There's nothing here!</p>
              </main>
            }
          />
        </Switch>
      </User.Provider>
    </Router>
  )
}

// By passing the `store` in as a wrapper around our React component
// we make the state available throughout it
ReactDOM.render(<App />, document.getElementById('react'))
