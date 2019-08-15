import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

const GET_MESSAGE = gql`
  query getMessage {
    greeting {
      content
    }
  }
`

const App = () => {
  const { data } = useQuery(GET_MESSAGE)
  return (
    <div>
      <h1>{data.greeting && data.greeting.content}</h1>
      <button onClick={() => console.log('event handler attached')}>Click me</button>
    </div>
  )
}

export default App