import React from "react";
import ReactDOMServer from "react-dom/server";
import { ApolloClient } from "apollo-client";
import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider, renderToStringWithData } from "react-apollo";

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
   * @param {ReactElement} options.appElement: Application main React Element
   * @param {Function} options.headElement A function called with the current request that return a React Element which will be placed in the HTML <head>
   * @param {Function} options.bodyBottomElement A function called with the current request that return a React Element which will be placed in the bottom of the HTML <body>
   * @param {Object} options.req Express request object
   * @param {Object} options.cache GQL data source cache config object - optional
   */
  return ({
    dataSources,
    cache,
    context,
    htmlTagAttrs,
    appElement,
    headElement,
    bodyBottomElement,
    req
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

    const client = new ApolloClient({
      ssrMode: true,
      link: new SchemaLink({
        schema,
        context: {
          ...context,
          dataSources
        }
      }),
      cache: new InMemoryCache()
    });

    // wrapping main component with Apollo Provider
    const app = <ApolloProvider client={client}>{appElement}</ApolloProvider>;

    return renderToStringWithData(app).then(content => {
      const initialState = client.extract();
      const html = (
        <Html
          content={content}
          initialState={initialState}
          htmlTagAttrs={htmlTagAttrs}
          headElement={
            typeof headElement === "function" ? headElement({ req }) : null
          }
          bodyBottomElement={
            typeof bodyBottomElement === "function"
              ? bodyBottomElement({ req })
              : null
          }
        />
      );

      return `<!doctype html>\n${ReactDOMServer.renderToStaticMarkup(html)}`;
    });
  };
}
