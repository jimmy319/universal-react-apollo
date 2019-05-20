import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const GET_MESSAGE = gql`
  query getMessage {
    greeting {
      content
    }
  }
`

const App = () => {
  return (
    <div>
      <Query query={GET_MESSAGE}>
        {
          ({ data }) => {
            return (<h1>{data.greeting.content}</h1>)
          }
        }
      </Query>
      <button onClick={() => console.log('event handler attached')}>Click me</button>
    </div>
  )
}

export default App