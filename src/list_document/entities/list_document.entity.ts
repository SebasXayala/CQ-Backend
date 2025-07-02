import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from 'src/profile/entities/profile.entity';
import { RequiredDocuments } from 'src/required_documents/entities/required_documents.entity';

@Entity('list_document')
export class ListDocument {

    @PrimaryColumn()
    id_profile: number;

    @PrimaryColumn()
    id_required_documents: number;

    @ManyToOne(() => Profile, (profile) => profile.listDocuments)
    @JoinColumn({ name: 'id_profile' })
    profile: Profile;

    @ManyToOne(() => RequiredDocuments, (requiredDocuments) => requiredDocuments.listDocuments)
    @JoinColumn({ name: 'id_required_documents' })
    requiredDocuments: RequiredDocuments;
}
