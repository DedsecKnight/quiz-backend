import * as DataLoader from "dataloader";
import { User } from "../entity/User";
import { IUserRepo } from "../interfaces/IUserRepo";
import { container } from "../inversify.config";
import { TYPES } from "../types/types";

const userBatch = async (keys: number[]): Promise<User[]> => {
    const userRepo = container.get<IUserRepo>(TYPES.IUserRepo);
    const users = await userRepo.findByIds(keys);

    const userMap: {
        [key: number]: User;
    } = {};
    users.forEach((u) => {
        userMap[u.id] = u;
    });

    return keys.map((key) => userMap[key]);
};

export const UserLoader = () => new DataLoader<number, User>(userBatch);
