import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'document_status' })
export class DocumentStatus {
  @PrimaryGeneratedColumn({ name: 'id_document_status' })
  id_status: number;

  @Column({ unique: true, name: 'status' })
  name: string;

  @Column({ nullable: true })
  description: string;
}
