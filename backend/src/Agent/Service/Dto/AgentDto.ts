import { Agent } from "@/Agent/Model/Agent";

export class AgentDto {
  id: string;

  name: string;

  bio: string;

  address: string;

  imageUrl: string;

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