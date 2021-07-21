import { createConnection, getConnectionOptions } from "typeorm";

describe("basic", () => {
    beforeAll(async () => {
        const connectionOptions = await getConnectionOptions();
        Object.assign(connectionOptions, {
            database: "quiz-backend-test",
            synchronize: "true",
        });
        await createConnection(connectionOptions);
    });

    test("Create connection works", () => {
        expect(true);
    });
});
