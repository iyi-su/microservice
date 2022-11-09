import {readFileSync} from "node:fs";
import {join} from "node:path";
import {ApolloServer, ApolloServerPlugin} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import {createLogger, Logger, format, transports} from "winston";
import {__dirname} from "./paths.js";

export const logger: Logger = createLogger({
    level: process.env.LOG_LEVEL || "error",
    format: format.json(),
    defaultMeta: {service: process.env.SERVICE_NAME || "microservice"},
    transports: [
        new transports.Console(),
    ],
});

export async function start(
    resolvers,
    typeDefs: string = getDefaultTypeDefs(),
    plugins: ApolloServerPlugin[] = [],
): Promise<void> {
    const server = new ApolloServer<{}>({
        resolvers,
        typeDefs,
        plugins: [
            loggerPlugin, ...plugins,
        ],
    });
    const {url} = await startStandaloneServer(server, {
        listen: {
            port: parseInt(process.env.PORT || "4000"),
        },
    });
    logger.info(`listening on ${url}`);
}

const loggerPlugin = {
    async requestDidStart(requestContext) {
        logger.debug("request started", {query: requestContext.request.query});
        return {
            async parsingDidStart(requestContext) {
                logger.debug("parsing started");
            },

            async validationDidStart(requestContext) {
                logger.debug("validation started");
            },
        };
    },
};

function getDefaultTypeDefs(): string {
    return readFileSync(join(__dirname, "schema.graphql"), {encoding: "utf8"});
}
