import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Candidate } from 'src/candidate/entities/candidate.entity';
import { Document } from 'src/document/entities/document.entity';

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

    @Column({ type: 'integer' })
    id_document: number;

    @ManyToOne(() => Candidate, (candidate) => candidate.folder)
    @JoinColumn({ name: 'id_candidate' })
    candidate: Candidate;

    @OneToMany(() => Document, (document) => document.folder)
    documents: Document[];

}
