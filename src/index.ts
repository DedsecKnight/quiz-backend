import { buildSchema } from "type-graphql";

import "reflect-metadata";
import { createConnection } from "typeorm";

import { container } from "./inversify.config";
import { IDifficultyRepo } from "./interfaces/IDifficultyRepo";
import { TYPES } from "./inversify.types";

import { ApolloServer } from "apollo-server";
import { ServerContext } from "./server.config";

createConnection()
    .then(async () => {
        const schema = await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
        });

        await container
            .get<IDifficultyRepo>(TYPES.IDifficultyRepo)
            .initialize();

        const server = new ApolloServer({
            schema,
            playground: true,
            context: ({ req }) => ServerContext(req),
        });

        const { url } = await server.listen(5000);
        console.log(`Server is up at ${url}`);
    })
    .catch((err) => {
        console.log(err.message);
    });
