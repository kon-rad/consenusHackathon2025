import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { loadAccountFromPrivateKey } from '@/Agent/Service/loadAccountFromPrivateKey';

export async function createAndFundAccount(privateKeyHex: string) {
  const account = await loadAccountFromPrivateKey(privateKeyHex);

  // Initialize Aptos client with proper config
  const config = new AptosConfig({
    network: Network.TESTNET,
  });
  const client = new Aptos(config);

  try {
    // First, fund the account using the faucet
    console.log('Funding account via faucet...');
    await client.fundAccount({
      accountAddress: account.accountAddress,
      amount: 100_000_000, // 1 APT = 100_000_000 Octas
    });

    console.log('Account created and funded successfully!');
    console.log('Address:', account.accountAddress.toString());
    console.log('Public Key:', account.publicKey.toString());

    // Verify account exists and get balance
    const resources = await client.getAccountResources({
      accountAddress: account.accountAddress,
    });

    const aptCoinStore = resources.find((r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');

    if (aptCoinStore) {
      console.log('Balance:', (aptCoinStore.data as any).coin.value, 'Octas');
    }

    return account;
  } catch (error) {
    console.error('Error creating/funding account:', error);
    throw error;
  }
}

// Example usage:
// const privateKeyHex = "your_private_key_here";
// const account = await createAndFundAccount(privateKeyHex);
