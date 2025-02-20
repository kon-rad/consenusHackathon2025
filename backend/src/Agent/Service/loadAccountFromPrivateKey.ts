import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

export async function loadAccountFromPrivateKey(privateKeyHex: string): Promise<Account> {
  // Remove '0x' prefix if present
  const cleanPrivateKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;

  // Convert hex string to key bytes
  const keyBytes = Buffer.from(cleanPrivateKey, 'hex');

  // Create private key object
  const privateKey = new Ed25519PrivateKey(keyBytes);

  // Create Account instance
  const account = Account.fromPrivateKey({
    privateKey,
  });

  console.log('Account loaded successfully:');
  console.log('Address:', account.accountAddress.toString());
  console.log('Public Key:', account.publicKey.toString());

  return account;
}
