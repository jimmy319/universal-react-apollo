import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache
} from "@apollo/client";

import {
  ROOT_CONTAINER_ID,
  REHYDRATION_STATE_DATA_KEY
} from "./config/constants";

/**
 * Render universal application main component with server side prefetched state in client side
 * @param {ReactElement} appElement: Application main React Element
 * @param {Object} inMemoryCacheConfig apollo client InMemoryCache constructor config object (available options: https://www.apollographql.com/docs/react/advanced/caching/#configuration) - optional
 */
export default function clientRender(appElement, inMemoryCacheConfig) {
  // create apollo client
  const client = new ApolloClient({
    link: createHttpLink({
      uri: "/graphql",
      credentials: "same-origin"
    }),
    cache: new InMemoryCache(inMemoryCacheConfig).restore(
      window[REHYDRATION_STATE_DATA_KEY]
    ),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all"
      },
      query: {
        errorPolicy: "all"
      },
      mutate: {
        errorPolicy: "all"
      }
    }
  });

  // wrapping main component with Apollo Provider
  const app = <ApolloProvider client={client}>{appElement}</ApolloProvider>;

  // render to page
  ReactDOM.hydrate(app, document.getElementById(ROOT_CONTAINER_ID));
}
