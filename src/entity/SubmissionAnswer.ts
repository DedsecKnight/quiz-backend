import {
    BaseEntity,
    Entity,
    JoinColumn,
    OneToOne,
    Column,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./Answer";
import { Submission } from "./Submission";

@Entity()
export class SubmissionAnswer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    submissionId: number;
    @OneToOne(() => Submission)
    @JoinColumn({ name: "submissionId" })
    submissions: Submission;

    @Column({ type: "int" })
    answerId: number;
    @OneToOne(() => Answer)
    @JoinColumn({ name: "answerId" })
    answers: Answer;
}
