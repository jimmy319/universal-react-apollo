import React from 'react'
import { useQuery, gql } from '@apollo/client'

const GET_MESSAGE = gql`
  query getMessage {
    greeting {
      content
    }
  }
`

const App = () => {
  const { data } = useQuery(GET_MESSAGE)

  if (!data) {
    return null
  }

  return (
    <div>
      <h1>{data.greeting.content}</h1>
      <button onClick={() => console.log('event handler attached')}>Click me</button>
    </div>
  )
}

export default App