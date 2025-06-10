import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id_role: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 50 })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
