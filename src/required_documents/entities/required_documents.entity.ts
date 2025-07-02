import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ListDocument } from 'src/list_document/entities/list_document.entity';

@Entity('required_documents')
export class RequiredDocuments {

    @PrimaryGeneratedColumn()
    id_required_documents: number;

    @Column({ length: 200 })
    name_required_documents: string;

    @OneToMany(() => ListDocument, (listDocument) => listDocument.requiredDocuments)
    listDocuments: ListDocument[];
}
