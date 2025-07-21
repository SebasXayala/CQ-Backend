import { PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Document } from "src/document/entities/document.entity";

@Entity("document_status")
export class DocumentStatus {
    @PrimaryGeneratedColumn()
    id_document_status: number;

    @Column({ length: 50 })
    status: string;

    @Column({ length: 255 })
    description: string;

    @OneToOne(() => Document, (documents) => documents.documentStatus)
    document: Document;
}
