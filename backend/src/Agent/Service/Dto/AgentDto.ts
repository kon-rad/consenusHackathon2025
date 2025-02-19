import { Agent } from "@/Agent/Model/Agent";
import { ApiProperty } from "@nestjs/swagger";

export class AgentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  metadata: any;

  constructor(id: string, name: string, bio: string, address: string, imageUrl: string, metadata: any) {
    this.id = id;
    this.name = name;
    this.bio = bio;
    this.address = address;
    this.imageUrl = imageUrl;
    this.metadata = metadata;
  }

  public static fromModel(model: Agent): AgentDto {
    return new AgentDto(
      model.id,
      model.name,
      model.bio,
      model.address,
      model.imageUrl,
      model.metadata
    );
  }
}