import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./Answer";
import { Quiz } from "./Quiz";
import { User } from "./User";

@ObjectType()
@Entity()
export class Submission extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => ID)
    @Column()
    userId: number;
    @ManyToOne(() => User, (user: User) => user.submissions)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    quizId: number;

    @ManyToOne(() => Quiz, (quiz: Quiz) => quiz.submissions)
    @JoinColumn({ name: "quizId" })
    quiz: Quiz;

    @ManyToMany(() => Answer, (answer) => answer.submissions)
    @JoinTable({ name: "submission_answer" })
    answers: Answer[];
}
