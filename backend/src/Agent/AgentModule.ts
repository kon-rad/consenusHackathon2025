import { Module } from "@nestjs/common";
import { AgentController } from "./Controller/AgentController";
import { AgentService } from "./Service/AgentService";
import { TypeOrmModule } from "@nestjs/typeorm";
import { agentEntities } from "@/Agent/Model/agentEntities";

@Module({
  imports: [TypeOrmModule.forFeature(agentEntities)],
  controllers: [AgentController],
  providers: [AgentService]
})
export class AgentModule {
}