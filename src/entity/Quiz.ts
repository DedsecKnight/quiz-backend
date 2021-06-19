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
import { Category } from "./Category";
import { Difficulty } from "./Difficulty";
import { Question } from "./Question";
import { Submission } from "./Submission";
import { User } from "./User";

@Entity()
@ObjectType()
export class Quiz extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Column()
    @Field()
    quizName: string;

    @Column()
    authorId: number;
    @ManyToOne(() => User, (user: User) => user.quizzes)
    @JoinColumn({ name: "authorId" })
    author: User;

    @Column()
    difficultyId: number;
    @Field(() => Difficulty)
    @ManyToOne(() => Difficulty, (difficulty: Difficulty) => difficulty.quizzes)
    @JoinColumn({ name: "difficultyId" })
    difficulty: Difficulty;

    @Field(() => [Question])
    @OneToMany(() => Question, (question) => question.quiz)
    questions: Question[];

    @OneToMany(() => Submission, (submission: Submission) => submission.quiz)
    submissions: Submission[];

    @Column()
    categoryId: number;
    @ManyToOne(() => Category, (category: Category) => category.quizzes)
    @JoinColumn({ name: "categoryId" })
    @Field(() => Category)
    category: Category;
}
