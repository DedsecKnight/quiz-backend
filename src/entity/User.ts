import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany,
} from "typeorm";
import { Quiz } from "./Quiz";
import { Submission } from "./Submission";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    email: string;

    @Field()
    @Column()
    password: string;

    @OneToMany(() => Submission, (submission: Submission) => submission.user)
    submissions: Submission[];

    // @Field(() => [Quiz])
    @OneToMany(() => Quiz, (quiz: Quiz) => quiz.author)
    quizzes: Quiz[];
}
