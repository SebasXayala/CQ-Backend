import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ length: 50, unique: true })
  email: string;

  @Exclude()
  @Column({ length: 100 })
  password: string;

  @Column({ name: 'id_role' })
  id_role: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'id_role' })
  role: Role;
}
