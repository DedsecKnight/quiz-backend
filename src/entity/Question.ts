import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./Answer";
import { Quiz } from "./Quiz";

@Entity()
@ObjectType()
export class Question extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Field()
    @Column()
    question: string;

    @OneToMany(() => Answer, (answer: Answer) => answer.question)
    answers: Answer[];

    @Column()
    quizId: number;
    @ManyToOne(() => Quiz, (quiz: Quiz) => quiz.questions)
    @JoinColumn({ name: "quizId" })
    quiz: Quiz;
}
