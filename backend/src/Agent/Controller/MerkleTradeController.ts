import { Controller, Get, Post } from '@nestjs/common';
import { MerkleTradeClient } from '@/Agent/Service/MerkleTradeClient';

@Controller()
export class MerkleTradeController {
  constructor(private readonly client: MerkleTradeClient) {}

  @Get('/api/merkle/test')
  public async test() {
    return JSON.stringify(this.client.test());
  }

  @Post('/api/merkle/buy')
  public async buy() {
    return this.client.buyApt();
  }

  @Post('/api/merkle/sell')
  public async sell() {
    return this.client.sellApt();
  }
}
