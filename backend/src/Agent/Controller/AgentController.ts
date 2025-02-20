import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AgentService } from '../Service/AgentService';
import { CreateAgentDto } from '@/Agent/Service/Dto/CreateAgentDto';
import { AgentDto } from '@/Agent/Service/Dto/AgentDto';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @ApiCreatedResponse({ type: AgentDto, isArray: true })
  @Get('/api/agents')
  public async getAgents(): Promise<AgentDto[]> {
    return this.agentService.getAgents();
  }

  @ApiCreatedResponse({ type: AgentDto })
  @Get('/api/agents/:id')
  public async getAgent(@Param('id') id: string): Promise<AgentDto> {
    return this.agentService.getAgentById(id);
  }

  @ApiCreatedResponse({ type: AgentDto })
  @Post('/api/agents')
  public async createAgent(@Body() dto: CreateAgentDto): Promise<AgentDto> {
    return this.agentService.createAgent(dto);
  }
}
