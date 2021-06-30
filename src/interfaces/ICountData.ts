import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class CountData {
    @Field(() => Int)
    count: number;
}
