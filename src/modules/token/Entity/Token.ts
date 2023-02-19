import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "~modules/users/entity/User";

export type TokenTypes = "RECOVER_PASSWORD" | "EMAIL_AUTH";
export const TOKEN_TYPES_ENUM = ["RECOVER_PASSWORD", "EMAIL_AUTH"];

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ enum: TOKEN_TYPES_ENUM })
  type: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: "timestamptz" })
  expiry: number;

  @Column({ type: "timestamptz", nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
