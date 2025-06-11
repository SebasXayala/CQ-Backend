import { Candidate } from 'src/candidate/entities/candidate.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';


@Entity('position')
export class Position {
    @PrimaryGeneratedColumn()
    id_position: number;

    @Column({ length: 50 })
    title: string;

    @Column({ length: 200 })
    description: string;

    @OneToMany(() => Candidate, (candidate) => candidate.position)
    candidates: Candidate[];
}
