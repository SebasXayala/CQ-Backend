import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CandidateStatus } from '../../candidate-status/entities/candidate-status.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id_candidate: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 10 })
  identifier: string;

  @Column({ length: 20 })
  identifier_type: string;

  @Column({ length: 20 })
  profile: string;

  @ManyToOne(() => CandidateStatus)
  @JoinColumn({ name: 'id_candidate_status' })
  candidate_status: CandidateStatus;
}
