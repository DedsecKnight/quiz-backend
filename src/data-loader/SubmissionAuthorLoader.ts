import * as DataLoader from "dataloader";
import { User } from "../entity/User";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.types";

const userBatch = async (keys: number[]): Promise<User[]> => {
    const submissionRepo = container.get<ISubmissionRepo>(
        TYPES.ISubmissionRepo
    );
    const datas = await submissionRepo.findByIdsWithUser(keys);

    const scoreMap: { [key: number]: User } = {};
    datas.forEach((data) => {
        scoreMap[data.id] = data.user;
    });

    return keys.map((key) => scoreMap[key]);
};

export const SubmissionAuthorLoader = () =>
    new DataLoader<number, User>(userBatch);
