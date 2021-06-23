import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "type-graphql";

import "reflect-metadata";
import { createConnection } from "typeorm";

import { container } from "./inversify.config";
import { IDifficultyRepo } from "./interfaces/IDifficultyRepo";
import { TYPES } from "./types/types";
import { IErrorObj } from "./interfaces/IErrrorObj";
import * as cors from "cors";

createConnection()
    .then(async () => {
        const app = express();
        app.use(express.json());
        app.use(cors());

        const schema = await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
        });

        await container
            .get<IDifficultyRepo>(TYPES.IDifficultyRepo)
            .initialize();

        app.use(
            "/graphql",
            graphqlHTTP((req) => ({
                schema,
                graphiql: true,
                customFormatErrorFn: (error) => {
                    const errorObj: IErrorObj = {
                        statusCode: 404,
                        message: error.message,
                    };
                    return errorObj;
                },
                context: {
                    headers: req.headers,
                },
            }))
        );

        app.listen(5000, () => {
            console.log("Server is listening on port 5000");
        });
    })
    .catch((err) => {
        console.log(err.message);
    });
