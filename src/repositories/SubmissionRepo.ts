import { injectable } from "inversify";
import { Answer } from "../entity/Answer";
import { Submission } from "../entity/Submission";
import { ISubmissionRepo, SubmissionArg } from "../interfaces/ISubmissionRepo";

@injectable()
export class SubmissionRepo implements ISubmissionRepo {
    async createSubmission({
        userId,
        quizId,
        answers,
    }: SubmissionArg): Promise<Submission> {
        const newSubmission = await Submission.create({
            userId,
            quizId,
        }).save();
        answers.forEach(async (answerId) => {
            const fetchedAnswer = await Answer.findOne({
                id: answerId,
            });
            await Submission.createQueryBuilder()
                .relation(Submission, "answers")
                .of(newSubmission)
                .add(fetchedAnswer);
        });
        return Submission.findOne(
            {
                id: newSubmission.id,
            },
            {
                relations: ["answers"],
            }
        );
    }
    findById(id: number): Promise<Submission> {
        return Submission.findOne(
            {
                id,
            },
            {
                relations: ["answers", "answers.submissions"],
            }
        );
    }
    async getScore(submissionId: number): Promise<number> {
        const subObj = await Submission.findOne(
            {
                id: submissionId,
            },
            {
                relations: ["answers"],
            }
        );
        return Math.floor(
            (subObj.answers.filter((answer) => answer.isCorrect).length * 100) /
                subObj.answers.length
        );
    }
    getUserSubmissions(userId: number): Promise<Submission[]> {
        return Submission.find({
            where: { userId },
            relations: ["answers", "quiz", "quiz.difficulty"],
        });
    }
}