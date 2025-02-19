import { Module } from '@nestjs/common';
import { AgentModule } from "@/Agent/AgentModule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmOptions } from "@/dataSource/dataSource";

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmOptions), AgentModule],
})
export class AppModule {
}
