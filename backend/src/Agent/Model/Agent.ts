import { Column, Entity, PrimaryColumn } from "typeorm";
import { CreateAgentDto } from "@/Agent/Service/Dto/CreateAgentDto";
import { IdGenerator } from "@/Shared/IdGenerator";

@Entity()
export class Agent {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  bio: string;

  @Column()
  address: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'jsonb' })
  metadata: any;

  constructor(name: string, bio: string, imageUrl: string, metadata: any) {
    this.id = IdGenerator.generate();
    this.name = name;
    this.bio = bio;
    this.address = '0x123';
    this.imageUrl = imageUrl;
    this.metadata = metadata;
  }

  public static fromDto(dto: CreateAgentDto) {
    return new Agent(
      dto.name,
      dto.bio,
      dto.imageUrl,
      dto.metadata
    )
  }
}