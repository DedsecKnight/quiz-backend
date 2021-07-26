import { Connection } from "typeorm";
import { TYPES } from "../inversify.types";
import { container } from "../inversify.config";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";
import { createMockConnection } from "./mock/MockConnection";

let connection: Connection;
let diffRepo: IDifficultyRepo;

beforeAll(async () => {
    connection = await createMockConnection();
    diffRepo = container.get<IDifficultyRepo>(TYPES.IDifficultyRepo);
});

describe("Initial Test", () => {
    test("Initialize difficulties", async () => {
        await diffRepo.initialize();
    });

    test("Get difficulties obj", async () => {
        const objs = await diffRepo.findByIds([1, 2, 3]);
        expect(objs.length).toBe(3);
    });
});

afterAll(async () => {
    // await connection.dropDatabase();
    await connection.close();
});
