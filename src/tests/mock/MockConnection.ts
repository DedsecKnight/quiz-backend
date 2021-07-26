import { createConnection, getConnectionOptions } from "typeorm";

export const createMockConnection = async () => {
    const connectionOptions = await getConnectionOptions();
    Object.assign(connectionOptions, {
        database: "quiz-backend-test",
        synchronize: "true",
        logging: "true",
    });
    const connection = await createConnection(connectionOptions);
    return connection;
};
