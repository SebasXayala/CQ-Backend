import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Candidate } from 'src/candidate/entities/candidate.entity';
import { ListDocument } from 'src/list_document/entities/list_document.entity';

@Entity('profile')
export class Profile {

    @PrimaryGeneratedColumn()
    id_profile: number;

    @Column({ length: 50, unique: true })
    name: string;

    @OneToMany(() => Candidate, (candidate) => candidate.profile)
    candidates: Candidate[];

    @OneToMany(() => ListDocument, (listDocument) => listDocument.profile)
    listDocuments: ListDocument[];
}
