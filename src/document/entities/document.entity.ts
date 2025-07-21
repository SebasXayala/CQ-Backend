import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { DocumentStatus } from "src/document_status/entities/document_status.entity";
import { Folder } from "src/folder/entities/folder.entity";

@Entity("documents")
export class Document {

    @PrimaryGeneratedColumn()
    id_document: number;

    @Column({ length: 20 })
    document_type: string;

    @Column({ length: 100 })
    document_name: string;

    @Column()
    id_document_status: number;

    @Column()
    id_folder: number;

    @Column({ type: 'text' })
    document_url: string;

    @Column({ type: 'date' })
    modification_date: Date;

    @OneToOne(() => DocumentStatus, (document_status) => document_status.document)
    @JoinColumn({ name: 'id_document_status' })
    documentStatus: DocumentStatus;

    @ManyToOne(() => Folder, (folder) => folder.documents)
    @JoinColumn({ name: 'id_folder' })
    folder: Folder;
}
