import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from 'src/profile/entities/profile.entity';

@Entity('required_documents')
export class RequiredDocuments {

    @PrimaryGeneratedColumn()
    id_required_documents: number;

    @Column({ length: 80 })
    name_required_documents: string;

    @Column()
    id_profile: number;

    @ManyToOne(() => Profile, (profile) => profile.requiredDocuments)
    @JoinColumn({ name: 'id_profile' })
    profile: Profile;
}
