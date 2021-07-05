import * as DataLoader from "dataloader";
import { Answer } from "../entity/Answer";
import { Submission } from "../entity/Submission";

const answersBatch = async (keys: number[]): Promise<Answer[][]> => {
    const submissions = await Submission.createQueryBuilder("submission")
        .leftJoinAndSelect("submission.answers", "answer")
        .where("submission.id in (:...keys)", { keys })
        .getMany();
    const subMap: { [key: number]: Answer[] } = {};
    submissions.forEach((sub) => {
        subMap[sub.id] = sub.answers;
    });

    return keys.map((key) => subMap[key]);
};

export const SubmissionAnswersLoader = () =>
    new DataLoader<number, Answer[]>(answersBatch);
