import { User } from "../entity/User";
import { IUserRepo, UserScore } from "../interfaces/IUserRepo";
import { injectable } from "inversify";
import { getManager } from "typeorm";

@injectable()
export class UserRepo implements IUserRepo {
    findById(id: number): Promise<User> {
        return User.findOne({ id });
    }

    initializeObj(
        name: string,
        email: string,
        password: string
    ): Promise<User> {
        return User.create({ name, email, password }).save();
    }

    getAll(): Promise<User[]> {
        return User.find();
    }

    findByEmail(email: string): Promise<User> {
        return User.findOne({ email });
    }

    getScore(id: number): Promise<UserScore[]> {
        return getManager().query(`
            select sum(score) as totalScore, max(score) as maxScore from (
                select T.quizId, max(score) as score from (
                    select submission.id, submission.userId, submission.quizId, answer.answer, (sum(answer.isCorrect) / count(*))*100 as score from submission 
                    inner join submission_answer on submission.id = submission_answer.submissionId
                    inner join answer on submission_answer.answerId = answer.id
                    group by submission.id
                ) as T where userId = ${id} group by T.quizId
            ) as T2;
        `);
    }
}
