import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";

test("cpi worked as expected", () => {
  const svm = new LiteSVM();

  const doubleContract = Keypair.generate();
  const cpiAccount = Keypair.generate();

  svm.addProgramFromFile(doubleContract.publicKey, "./double.so");
  svm.addProgramFromFile(cpiAccount.publicKey, "./cpi.so");

  const payer = Keypair.generate();

  svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));

  const dataAccount = Keypair.generate();

  const ix = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: doubleContract.publicKey,
    }),
  ];

  const doubleIt = () => {
    const recentBlockhash = svm.latestBlockhash();

    const tx = new Transaction();
    tx.recentBlockhash = recentBlockhash;
    tx.add(...ix);
    tx.sign(payer, dataAccount);
    svm.sendTransaction(tx);

    const ix2 = new TransactionInstruction({
      keys: [
        { pubkey: dataAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: doubleContract.publicKey, isSigner: false, isWritable: true },
      ],
      programId: cpiAccount.publicKey,
      data: Buffer.from(""),
    });

    const blockhash = svm.latestBlockhash();

    const tx2 = new Transaction();

    tx2.recentBlockhash = blockhash;

    tx2.add(ix2);

    tx2.sign(payer);

    svm.sendTransaction(tx2);
    svm.expireBlockhash();
  };

  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();

  const newDataAcc = svm.getAccount(dataAccount.publicKey);

  expect(newDataAcc?.data[0]).toBe(0);
  expect(newDataAcc?.data[1]).toBe(1);
  expect(newDataAcc?.data[2]).toBe(0);
  expect(newDataAcc?.data[3]).toBe(0);
});
