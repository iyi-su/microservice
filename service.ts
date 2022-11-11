import {readFileSync} from "node:fs";
import {join} from "node:path";
import {ApolloServer, ApolloServerPlugin, BaseContext} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import {createLogger, Logger, format, transports} from "winston";
import {__dirname} from "./paths.js";

export const {
    npm_package_name: AppName = "microservice",
    npm_package_version: AppVersion = "0.0.0",
} = process.env;

export const logger: Logger = createLogger({
    level: process.env.LOG_LEVEL || "error",
    format: format.json(),
    defaultMeta: {
        service: AppName || "microservice",
        version: AppVersion || "0.0.0",
    },
    transports: [
        new transports.Console(),
    ],
});

export async function start<TContext extends BaseContext = {}>(
    resolvers,
    typeDefs: string = getDefaultTypeDefs(),
    plugins: ApolloServerPlugin[] = [],
): Promise<void> {
    const server = new ApolloServer<TContext>({
        resolvers,
        typeDefs,
        plugins: [
            loggerPlugin, ...plugins,
        ],
    });
    const options = {
        context: async (): Promise<TContext> => {
            return undefined;
        },
        listen: {
            port: parseInt(process.env.PORT || "4000"),
        },
    };
    const {url} = await startStandaloneServer(server, options);
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
