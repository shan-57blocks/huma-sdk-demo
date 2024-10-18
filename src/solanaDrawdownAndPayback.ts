import {
  AnchorProvider,
  BN,
  setProvider,
  Wallet,
  web3
} from '@coral-xyz/anchor';
import {
  HumaSolanaContext,
  HumaSolanaProgramHelper,
  HumaSolanaReceivableHelper
} from '@huma-finance/sdk';
import { POOL_NAME, SolanaChainEnum } from '@huma-finance/shared';
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';
import 'dotenv/config';

const createReceivable = async (
  connection: Connection,
  keypair: Keypair,
  solanaHumaContext: HumaSolanaContext,
  referenceId: string
) => {
  const humaReceivableHelper = new HumaSolanaReceivableHelper({
    solanaContext: solanaHumaContext
  });

  const newAsset = Keypair.generate();

  const oneWeekFromNow = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const tx = await humaReceivableHelper.buildCreateReceivableTransaction(
    newAsset,
    {
      name: 'Test Receivable',
      uri: 'https://test.com',
      currencyCode: '840',
      receivableAmount: new BN(100000000),
      maturityDate: new BN(oneWeekFromNow),
      referenceId
    }
  );

  const txResult = await sendAndConfirmTransaction(connection, tx, [
    newAsset,
    keypair
  ]);

  console.log('Create receivable result:', txResult);
};

const submitReceivable = async (
  connection: Connection,
  keypair: Keypair,
  solanaHumaContext: HumaSolanaContext,
  referenceId: string
) => {
  const humaSolanaProgramHelper = new HumaSolanaProgramHelper({
    solanaContext: solanaHumaContext
  });

  const tx =
    await humaSolanaProgramHelper.buildSubmitReceivableTransaction(referenceId);

  const txResult = await sendAndConfirmTransaction(connection, tx, [keypair]);
  console.log('Submit receivable result:', txResult);
};

const payback = async (
  connection: Connection,
  keypair: Keypair,
  solanaHumaContext: HumaSolanaContext
) => {
  const humaSolanaProgramHelper = new HumaSolanaProgramHelper({
    solanaContext: solanaHumaContext
  });

  const tx = await humaSolanaProgramHelper.buildPaymentTransaction(
    new BN(5000000),
    true /* principalOnly */
  );

  const txResult = await sendAndConfirmTransaction(connection, tx, [keypair]);
  console.log('Payback result:', txResult);
};

const drawdown = async (
  connection: Connection,
  keypair: Keypair,
  solanaHumaContext: HumaSolanaContext
) => {
  const humaSolanaProgramHelper = new HumaSolanaProgramHelper({
    solanaContext: solanaHumaContext
  });

  const tx = await humaSolanaProgramHelper.buildDrawdownTransaction(
    new BN(10000000)
  );

  const txResult = await sendAndConfirmTransaction(connection, tx, [keypair]);
  console.log('Drawdown result:', txResult);
};

const getAccountInfo = async (solanaHumaContext: HumaSolanaContext) => {
  const humaSolanaProgramHelper = new HumaSolanaProgramHelper({
    solanaContext: solanaHumaContext
  });

  const data = await humaSolanaProgramHelper.getAccountInfo();

  console.log('Account info:', data);
};

(async () => {
  const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;
  const connection = new Connection(
    'https://api.devnet.solana.com',
    'confirmed'
  );

  const keypair = web3.Keypair.fromSecretKey(bs58.decode(TEST_PRIVATE_KEY));
  const wallet = new Wallet(keypair);
  setProvider(new AnchorProvider(connection, wallet));

  const solanaHumaContext = new HumaSolanaContext({
    publicKey: wallet.publicKey,
    connection: connection,
    chainId: SolanaChainEnum.SolanaDevnet,
    poolName: POOL_NAME.ArfCreditPool3Months
  });

  const referenceId = `test-reference-id2-${new Date().getTime()}`;

  await createReceivable(connection, keypair, solanaHumaContext, referenceId);
  await submitReceivable(connection, keypair, solanaHumaContext, referenceId);
  await drawdown(connection, keypair, solanaHumaContext);
  console.log('***************');
  console.log('Account info before payback:');
  await getAccountInfo(solanaHumaContext);
  await payback(connection, keypair, solanaHumaContext);
  console.log('***************');
  console.log('Account info after payback:');
  await getAccountInfo(solanaHumaContext);
})();
