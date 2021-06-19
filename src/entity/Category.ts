import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";

@ObjectType()
@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Column()
    @Field()
    categoryName: string;

    @Field(() => [Quiz])
    @OneToMany(() => Quiz, (quiz: Quiz) => quiz.category)
    quizzes: Quiz[];
}
