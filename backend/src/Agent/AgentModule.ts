import { Module } from '@nestjs/common';
import { AgentController } from './Controller/AgentController';
import { AgentService } from './Service/AgentService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { agentEntities } from '@/Agent/Model/agentEntities';
import { MerkleTradeClient } from '@/Agent/Service/MerkleTradeClient';
import { MerkleTradeController } from '@/Agent/Controller/MerkleTradeController';

@Module({
  imports: [TypeOrmModule.forFeature(agentEntities)],
  controllers: [AgentController, MerkleTradeController],
  providers: [AgentService, MerkleTradeClient],
})
export class AgentModule {}
