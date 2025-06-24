import { IsString } from "class-validator";
import { Candidate } from "src/candidate/entities/candidate.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('candidate_status')
export class CandidateStatus {

    @PrimaryGeneratedColumn()
    id_candidate_status: number;

    @IsString()
    @Column({ length: 20 })
    status: string;

    @IsString()
    @Column({ length: 100 })
    description: string;

    @OneToMany(() => Candidate, (candidate) => candidate.candidate_status)
    candidates: Candidate[];
}
