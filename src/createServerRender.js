import React from "react";
import ReactDOMServer from "react-dom/server";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import {
  renderToStringWithData,
  getDataFromTree
} from "@apollo/client/react/ssr";

import Html from "./Html";

/**
 * Return a function which is responsible for fetching all required states via graphql operations and render application with them in server side
 * @param {Object} options Server side rendering options
 * @param {String} options.typeDefs GraphQL schema language string, array of GraphQL schema language strings or a function that return an array of GraphQL schema strings
 * @param {Object} options.resolvers GQL resolvers object - optional
 * @param {Object} options.schemaDirectives schema directive definition object
 * @return {Function} server render function
 */
export default function createServerRender({
  typeDefs,
  resolvers,
  schemaDirectives
}) {
  // create Apollo client
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives
  });

  /**
   * Server render function
   * @param {Object} options
   * @param {Object} options.dataSources GQL data sources object
   * @param {Object} options.context context object which will be shared across all resolvers
   * @param {Object} options.htmlTagAttrs dom attributes of html tag
   * @param {Function} options.appElement: A function called with the current request that returns a React Element which will be placed in the <body>
   * @param {Function} options.headElement A function called with the current request that returns a React Element which will be placed in the <head>
   * @param {Function} options.bodyBottomElement A function called with the current request that returns a React Element which will be placed in the bottom of the appElement
   * @param {Object} options.req Express request object
   * @param {Object} options.res Express response object
   * @param {Object} options.cache GQL data source cache config object - optional
   */
  return async ({
    dataSources,
    cache,
    context,
    htmlTagAttrs,
    appElement,
    headElement,
    bodyBottomElement,
    req,
    res
  }) => {
    // initialize the data source, required for Apollo RESTDataSource
    for (const dataSource of Object.values(dataSources)) {
      if (typeof dataSource.initialize === "function") {
        dataSource.initialize({
          context,
          cache
        });
      }
    }

    // prepare apollo client
    const apolloClientOptions = {
      ssrMode: true,
      link: new SchemaLink({
        schema,
        context: {
          ...context,
          dataSources
        }
      }),
      cache: new InMemoryCache(),
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
    };

    const client = new ApolloClient(apolloClientOptions);
    // client for ssr only (no need to do data extraction)
    const ssrClient = new ApolloClient(apolloClientOptions);

    // wrapping head component with Apollo Provider
    const headWithApollo = (
      <ApolloProvider client={ssrClient}>
        {typeof headElement === "function" ? headElement({ req }) : null}
      </ApolloProvider>
    );
    // wrapping main component with Apollo Provider
    const appWithApollo = (
      <ApolloProvider client={client}>
        {typeof appElement === "function" && appElement({ req, res })}
      </ApolloProvider>
    );

    const app = await renderToStringWithData(appWithApollo);
    const head = await getDataFromTree(headWithApollo);

    const initialState = client.extract();
    const html = (
      <Html
        content={app}
        initialState={initialState}
        htmlTagAttrs={htmlTagAttrs}
        head={head}
        bodyBottomElement={
          typeof bodyBottomElement === "function"
            ? bodyBottomElement({ req })
            : null
        }
        inlineStateNonce={req.nonce}
      />
    );

    return `<!doctype html>\n${ReactDOMServer.renderToStaticMarkup(html)}`;
  };
}
