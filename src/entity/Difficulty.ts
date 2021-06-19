import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";

@Entity()
@ObjectType()
export class Difficulty extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Column()
    @Field()
    type: string;

    @Field(() => [Quiz])
    @OneToMany(() => Quiz, (quiz: Quiz) => quiz.difficulty)
    quizzes: Quiz[];
}
