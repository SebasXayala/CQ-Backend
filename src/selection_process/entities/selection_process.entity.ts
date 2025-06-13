import { Candidate } from "src/candidate/entities/candidate.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity('selection_process')
export class SelectionProcess {
  @PrimaryGeneratedColumn()
  id_selection_process: number;

  @OneToOne(() => Candidate, (candidate) => candidate.selectionProcess)
  candidate: Candidate;

  @Column()
  start_date: Date;

  @Column({ nullable: true })
  end_date?: Date;
}
