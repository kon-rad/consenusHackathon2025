import { Injectable } from '@nestjs/common';
import { AgentDto } from "@/Agent/Service/Dto/AgentDto";
import { Repository } from "typeorm";
import { Agent } from "@/Agent/Model/Agent";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAgentDto } from "@/Agent/Service/Dto/CreateAgentDto";

@Injectable()
export class AgentService {
  constructor(@InjectRepository(Agent)
              private readonly repository: Repository<Agent>) {
  }

  public async getAgents(): Promise<AgentDto[]> {
    const agents = await this.repository.find();

    return agents.map(AgentDto.fromModel);
  }

  public async getAgentById(id: string): Promise<AgentDto> {
    const agent = await this.repository.findOneBy({ id });
    if (!agent) {
      throw new Error('Agent not found');
    }

    return AgentDto.fromModel(agent);
  }

  public async createAgent(dto: CreateAgentDto): Promise<AgentDto> {
    const agent = Agent.fromDto(dto);
    await this.repository.insert(agent);

    return AgentDto.fromModel(agent);
  }
}
