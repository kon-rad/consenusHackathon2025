import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AgentService } from '../Service/AgentService';
import { CreateAgentDto } from "@/Agent/Service/Dto/CreateAgentDto";
import { AgentDto } from "@/Agent/Service/Dto/AgentDto";

@Controller()
export class AgentController {
  constructor(private readonly agentService: AgentService) {
  }

  @Get('/api/agents')
  public async getAgents(): Promise<AgentDto[]> {
    return this.agentService.getAgents();
  }

  @Get('/api/agents/:id')
  public async getAgent(@Param('id') id: string): Promise<AgentDto> {
    return this.agentService.getAgentById(id);
  }

  @Post('/api/agents')
  public async createAgent(@Body() dto: CreateAgentDto): Promise<AgentDto> {
    return this.agentService.createAgent(dto);
  }
}
