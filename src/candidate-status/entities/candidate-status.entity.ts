import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CandidateStatus {
  @PrimaryGeneratedColumn()
  id_candidate_status: number;

  @Column({ length: 20 })
  state: string;

  @Column({ length: 50 })
  description: string;
}
