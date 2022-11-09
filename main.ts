#!/usr/bin/env node

import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {ApolloServer} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import {createLogger, format, transports} from "winston";

const
    __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(join(dirname(__filename), "../../"));

const
    // @ts-ignore
    resolvers = (await import(join(__dirname, "resolvers.js"))).default,
    typeDefs = readFileSync(join(__dirname, "schema.graphql"), {encoding: "utf8"});

const
    logger = createLogger({
        level: process.env.LOG_LEVEL || "error",
        format: format.json(),
        defaultMeta: {service: process.env.SERVICE_NAME || "microservice"},
        transports: [
            new transports.Console(),
        ],
    }),
    loggerPlugin = {
        // fires whenever a GraphQL request is received from a client.
        async requestDidStart(requestContext) {
            logger.debug("request started", {query: requestContext.request.query});
            return {
                // Fires whenever Apollo Server will parse a GraphQL
                // request to create its associated document AST.
                async parsingDidStart(requestContext) {
                    logger.debug("parsing started");
                },

                // Fires whenever Apollo Server will validate a
                // request's document AST against your GraphQL schema.
                async validationDidStart(requestContext) {
                    logger.debug("validation started");
                },
            };
        },
    },
    plugins = [
        loggerPlugin,
    ],
    server = new ApolloServer<{}>({resolvers, typeDefs, plugins}),
    {url} = await startStandaloneServer(server, {
        listen: {
            port: parseInt(process.env.PORT || "4000"),
        },
    });

logger.info(`listening on ${url}`);
