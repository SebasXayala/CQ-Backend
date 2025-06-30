import { DocumentStatus } from "src/document_status/entities/document_status.entity";
import { Folder } from "src/folder/entities/folder.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'documents' })
export class Document {

  @PrimaryGeneratedColumn()
  id_document: number;

  @Column({ length: 20 })
  document_type: string;

  @Column()
  document_url: string; // Agregado para URL del documento

  @ManyToOne(() => Folder, folder => folder.documents)
  @JoinColumn({ name: 'id_folder' })
  folder: Folder;

  

  @ManyToOne(() => DocumentStatus, { eager: true })
  @JoinColumn({ name: 'id_status' })
  status: DocumentStatus;
  
  /*
  @OneToMany(() => DocumentHistory, history => history.document)
  histories: DocumentHistory[];
  */
}
