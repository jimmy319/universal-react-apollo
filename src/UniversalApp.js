import { ApolloServer } from "apollo-server-express";

import serverRender from "./serverRender";
import { LIB_TAG } from "./config/constants";

const initServer = function(
  app,
  routes,
  { typeDefs, resolvers, dataSources, contextCreator },
  production
) {
  // mount apollo-server-express middleware
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => dataSources,
    context: contextCreator,
    uploads: false,
    playground: !production
  });
  apolloServer.applyMiddleware({ app });

  // mount application routing
  if (Array.isArray(routes)) {
    routes.forEach(
      ({
        path,
        method = "get",
        appElement,
        headElement,
        bodyBottomElement,
        middlewareChain = []
      }) => {
        app[method.toLowerCase()](path, middlewareChain, (req, res, next) => {
          serverRender({
            appElement,
            headElement,
            bodyBottomElement,
            req,
            typeDefs,
            resolvers,
            dataSources,
            context: contextCreator({ req, connection: {}, res })
          })
            .then(html => {
              res.status(200);
              res.send(html);
              res.end();
            })
            .catch(exception => {
              const error = new Error(
                `[${LIB_TAG}] Error occurs during server-side rendering, details: ${exception}`
              );
              next(error);
            });
        });
      }
    );
  } else {
    console.error(
      `[${LIB_TAG}] Required argument - routes is not present or not an array`
    );
  }
};

export default initServer;
