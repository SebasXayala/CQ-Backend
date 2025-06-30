import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/document/entities/document.entuty";

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id_folder: number;

  @Column()
  id_candidate: number;

  @Column({ type: 'date' })
  creation_date: Date;

  @Column({ type: 'date' })
  modification_date: Date;

  @OneToMany(() => Document, document => document.folder)
  documents: Document[];
  } 
