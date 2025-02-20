import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  metadata: any;
}
