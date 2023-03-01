import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ enum: TOKEN_TYPES_ENUM })
  type: TokenTypes;

  @Column()
  token: string;

  @Column({ type: "timestamptz" })
  expiry: Date;

  @Column({ type: "timestamptz", nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
