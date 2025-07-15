import { Position } from 'src/position/entities/position.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { CandidateStatus } from 'src/candidate_status/entities/candidate_status.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { SelectionProcess } from 'src/selection_process/entities/selection_process.entity';
import { Folder } from 'src/folder/entities/folder.entity';
import { Exclude } from 'class-transformer';



@Entity('candidate')
export class Candidate {

    @PrimaryGeneratedColumn()
    id_candidate: number;

    @Column({ length: 20 })
    name: string;

    @Column({ length: 8 })
    identifier: string;

    @Column({ length: 20 })
    identifier_type: string;

    @Column({ length: 50 })
    email: string;

    @Column({ type: 'char', length: 10 })
    phone: string;

    @Exclude()
    @Column({ length: 100 })
    password: string;

    @ManyToOne(() => Profile, (profile) => profile.candidates)
    @JoinColumn({ name: 'id_profile' })
    profile: Profile;

    @ManyToOne(() => CandidateStatus, (candidate_status) => candidate_status.candidates)
    @JoinColumn({ name: 'id_candidate_status' })
    candidate_status: CandidateStatus;

    @ManyToOne(() => Position, (position) => position.candidates)
    @JoinColumn({ name: 'id_position' })
    position: Position;

    @OneToOne(() => SelectionProcess, (selectionProcess) => selectionProcess.candidate)
    @JoinColumn({ name: 'id_selection_process' })
    selectionProcess: SelectionProcess;

    @OneToMany(() => Folder, (folder) => folder.candidate)
    folders: Folder[];
}
