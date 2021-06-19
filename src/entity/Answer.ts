import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Question } from "./Question";
import { Submission } from "./Submission";

@ObjectType()
@Entity()
export class Answer extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Column()
    @Field()
    answer: string;

    @Column()
    @Field()
    isCorrect: boolean;

    @Column()
    questionId: number;
    @ManyToOne(() => Question, (question: Question) => question.answers)
    @JoinColumn({ name: "questionId" })
    question: Question;

    @Field(() => [Submission])
    @ManyToMany(() => Submission, (submission) => submission.answers)
    submissions: Submission[];
}
