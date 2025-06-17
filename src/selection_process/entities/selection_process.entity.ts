import { Candidate } from "src/candidate/entities/candidate.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity('selection_process')
export class SelectionProcess {
  @PrimaryGeneratedColumn()
  id_process: number;

  @Column()
  start_date: Date;

  @Column({ nullable: true })
  end_date?: Date;

  @OneToOne(() => Candidate, (candidate) => candidate.selectionProcess)
  candidate: Candidate;
}
