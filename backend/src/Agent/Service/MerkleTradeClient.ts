import { Injectable } from '@nestjs/common';
import { MerkleClient, MerkleClientConfig } from '@merkletrade/ts-sdk';

import { Account, Aptos, InputEntryFunctionData } from '@aptos-labs/ts-sdk';
import { loadAccountFromPrivateKey } from '@/Agent/Service/loadAccountFromPrivateKey';

const USDC_AMOUNT = 10;
const LEVERAGE_SIZE = 31;

@Injectable()
export class MerkleTradeClient {
  private instances: {
    merkle: MerkleClient;
    aptos: Aptos;
    account: Account;
  };

  constructor() {
    this.init();
  }

  private async init() {
    const merkle = new MerkleClient(await MerkleClientConfig.mainnet());
    const aptos = new Aptos(merkle.config.aptosConfig);
    const account = await loadAccountFromPrivateKey(process.env.APTOS_WALLET_PRIVATE_KEY);

    this.instances = {
      merkle: merkle,
      aptos: aptos,
      account: account,
    };
  }

  private async openPosition(usdcAmount, leverage, isBuy) {
    const { merkle, account } = this.instances;
    // Convert USDC amount to proper decimals (6 decimals)
    const collateralDelta = BigInt(usdcAmount * 1_000_000);

    // Calculate size delta based on leverage (collateral * leverage)
    const sizeDelta = collateralDelta * BigInt(leverage);

    // Create market order payload
    const order = await merkle.payloads.placeMarketOrder({
      pair: 'APT_USD',
      userAddress: account.accountAddress,
      sizeDelta: sizeDelta,
      collateralDelta: collateralDelta,
      isLong: isBuy,
      isIncrease: true,
    });

    return order;
  }

  public async buyApt() {
    const order = await this.openPosition(USDC_AMOUNT, LEVERAGE_SIZE, true);

    const transaction = await this.sendTransaction(order);
    console.log('Successfully placed order!');
    return transaction;
  }

  public async sellApt() {
    const order = await this.openPosition(USDC_AMOUNT, LEVERAGE_SIZE, false);

    const transaction = await this.sendTransaction(order);
    console.log('Successfully placed order!');
    return transaction;
  }

  public async test() {
    return this.getUsdBalance();
  }

  public async getPairs() {
    const pairs = await this.instances.merkle.getAllPairInfos();
    console.log(pairs);
    return pairs;
  }

  private async getResources() {
    const { aptos, account } = this.instances;

    try {
      // Try to get account resources to check if account exists
      const resources = await aptos.getAccountResources({
        accountAddress: account.accountAddress,
      });
      console.log(resources);

      const aptCoinStore = resources.find((r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');

      if (aptCoinStore) {
        console.log('Balance:', (aptCoinStore.data as any).coin.value, 'Octas');
      }
    } catch (e: any) {
      if (e.message?.includes('Account not found')) {
        console.log('Account not initialized on chain yet. Please fund it with testnet APT from:');
        console.log('https://aptoslabs.com/testnet-faucet');
      } else {
        throw e;
      }
    }
  }

  private async getUsdBalance() {
    const { merkle, account } = this.instances;

    const usdcBalance = await merkle.getUsdcBalance({
      accountAddress: account.accountAddress,
    });

    console.log(`USDC Balance: ${Number(usdcBalance) / 1e6} USDC`);
  }

  private async sendTransaction(payload: InputEntryFunctionData) {
    const { aptos, account } = this.instances;

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: payload,
    });
    const { hash } = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const committedTransaction = await aptos.waitForTransaction({ transactionHash: hash });
    console.log(committedTransaction);
    return committedTransaction;
  }

  private async getAllCoinsBalance() {
    const { merkle, account, aptos } = this.instances;

    try {
      // Получаем все ресурсы аккаунта
      const resources = await aptos.account.getAccountResources({
        accountAddress: account.accountAddress,
      });

      // Фильтруем только coin resources
      const coinResources = resources.filter((resource) => resource.type.startsWith('0x1::coin::CoinStore<'));

      // Массив для хранения информации о балансах
      const balances = [];

      // Обрабатываем каждый coin resource
      for (const resource of coinResources) {
        // Извлекаем тип монеты из полного строкового представления
        const coinType = resource.type.match(/<(.+)>/)?.[1];
        if (!coinType) continue;

        // Получаем баланс
        const balance = (resource.data as any).coin.value;

        // Получаем информацию о монете
        try {
          const coinInfo = await aptos.account.getAccountResource({
            accountAddress: '0x1',
            resourceType: `0x1::coin::CoinInfo<${coinType}>`,
          });

          console.log(coinInfo);
          const decimals = coinInfo.decimals;
          const name = coinInfo.name;
          const symbol = coinInfo.symbol;

          // Добавляем информацию в массив
          balances.push({
            coinType,
            symbol,
            name,
            decimals,
            balance,
            // Конвертируем баланс с учетом decimals
            formattedBalance: Number(balance) / Math.pow(10, decimals),
          });
          console.log(balances);
        } catch (error) {
          console.log(error);
          console.warn(`Не удалось получить информацию о монете ${coinType}`);
          balances.push({
            coinType,
            balance,
            formattedBalance: balance,
          });
        }
        return '';
      }

      // Выводим результаты
      console.log('\nБалансы аккаунта:');
      console.log('==================');

      balances.forEach((coin) => {
        console.log(coin);
        console.log(`\n${coin.name || coin.coinType}:`);
        console.log(`Symbol: ${coin.symbol || 'N/A'}`);
        console.log(`Balance: ${coin.formattedBalance}`);
        console.log(`Raw Balance: ${coin.balance}`);
        console.log(`Decimals: ${coin.decimals || 'N/A'}`);
      });

      return balances;
    } catch (error) {
      console.error('Ошибка при получении балансов:', error);
      throw error;
    }
  }

  private generateAccount() {
    const account = Account.generate();
    console.log(account.privateKey.toHexString());
  }
}
