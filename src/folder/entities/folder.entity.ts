import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Candidate } from 'src/candidate/entities/candidate.entity';

@Entity('folder')
export class Folder {

    @PrimaryGeneratedColumn()
    id_folder: number;

    @Column({ type: 'integer' })
    id_candidate: number;

    @Column({ type: 'date' })
    creation_date: Date;

    @Column({ type: 'date' })
    modification_date: Date;

    @ManyToOne(() => Candidate, (candidate) => candidate.folders)
    @JoinColumn({ name: 'id_candidate' })
    candidate: Candidate;
}
