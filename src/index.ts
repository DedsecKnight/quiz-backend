import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "type-graphql";

import "reflect-metadata";
import { createConnection } from "typeorm";

import { Difficulty } from "./entity/Difficulty";

createConnection()
    .then(async () => {
        const app = express();
        app.use(express.json());

        const schema = await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
        });

        const difficulties = await Difficulty.find();
        if (!difficulties.length) {
            ["Easy", "Normal", "Hard"].forEach(async (type) => {
                const newDiff = Difficulty.create({
                    type,
                });
                await newDiff.save();
            });
        }

        app.use(
            "/graphql",
            graphqlHTTP({
                schema,
                graphiql: true,
            })
        );

        app.listen(5000, () => {
            console.log("Server is listening on port 5000");
        });
    })
    .catch((err) => {
        console.log(err.message);
    });
