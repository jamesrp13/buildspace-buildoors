import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js"
import { PROGRAM_ID as METADATA_PROGEAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PROGRAM_ID, STAKE_MINT } from "./constants"

export function createInitializeStakeAccountInstruction(
  nftHolder: PublicKey,
  nftTokenAccount: PublicKey
): TransactionInstruction {
  const [stakeAccount] = PublicKey.findProgramAddressSync(
    [nftHolder.toBuffer(), nftTokenAccount.toBuffer()],
    PROGRAM_ID
  )

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: nftHolder,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: nftTokenAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: stakeAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: SystemProgram.programId,
        isWritable: false,
        isSigner: false,
      },
    ],
    data: Buffer.from([0]),
  })
}

export function createStakeInstruction(
  nftHolder: PublicKey,
  nftTokenAccount: PublicKey,
  nftMint: PublicKey,
  nftEdition: PublicKey
): TransactionInstruction {
  const [stakeAccount] = PublicKey.findProgramAddressSync(
    [nftHolder.toBuffer(), nftTokenAccount.toBuffer()],
    PROGRAM_ID
  )

  const [delegatedAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    PROGRAM_ID
  )

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: nftHolder,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: nftTokenAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: nftMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nftEdition,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: stakeAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: delegatedAuth,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: METADATA_PROGEAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from([1]),
  })
}

export function createRedeemInstruction(
  nftHolder: PublicKey,
  nftTokenAccount: PublicKey,
  userStakeTokenAccount: PublicKey
): TransactionInstruction {
  const [stakeAccount] = PublicKey.findProgramAddressSync(
    [nftHolder.toBuffer(), nftTokenAccount.toBuffer()],
    PROGRAM_ID
  )

  const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    PROGRAM_ID
  )

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: nftHolder,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: nftTokenAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: stakeAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: STAKE_MINT,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mintAuth,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: userStakeTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from([2]),
  })
}

export function createUnstakeInstruction(
  nftHolder: PublicKey,
  nftTokenAccount: PublicKey,
  nftMint: PublicKey,
  nftEdition: PublicKey,
  userStakeTokenAccount: PublicKey
): TransactionInstruction {
  const [stakeAccount] = PublicKey.findProgramAddressSync(
    [nftHolder.toBuffer(), nftTokenAccount.toBuffer()],
    PROGRAM_ID
  )

  const [delegatedAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    PROGRAM_ID
  )

  const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    PROGRAM_ID
  )

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: nftHolder,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: nftTokenAccount,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: nftMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nftEdition,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: stakeAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: delegatedAuth,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: STAKE_MINT,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mintAuth,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: userStakeTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: METADATA_PROGEAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from([3]),
  })
}
