import React from 'react'
import Back from '../Back'

import './styles.css'

const Container = ({ children, history }) => (
  <div className='container' history={history}>
    <Back history={history} />
    {children}
  </div>
)

export default Container
