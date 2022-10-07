import { Center, VStack, Text, Button } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { MouseEventHandler, useCallback, useEffect, useState } from "react"
import { StakeAccount } from "../utils/accounts"
import { LOOTBOX_PROGRAM_ID } from "../utils/constants"
import { useWorkspace } from "./WorkspaceProvider"
import { LootboxProgram } from "../utils/lootbox_program"
import { Program } from "@project-serum/anchor"
import { SwitchboardProgram } from "@switchboard-xyz/switchboard-v2"
import {
  createInitSwitchboardInstructions,
  createOpenLootboxInstructions,
} from "../utils/instructions"
import { AnchorNftStaking } from "../utils/anchor_nft_staking"

export const Lootbox = ({
  stakeAccount,
  nftTokenAccount,
  fetchUpstreamState,
}: {
  stakeAccount?: StakeAccount
  nftTokenAccount: PublicKey
  fetchUpstreamState: () => void
}) => {
  const [isConfirmingTransaction, setIsConfirmingTransaction] = useState(false)
  const [availableLootbox, setAvailableLootbox] = useState(0)
  const walletAdapter = useWallet()
  const { stakingProgram, lootboxProgram, switchboardProgram } = useWorkspace()
  const { connection } = useConnection()

  const [userAccountExists, setUserAccountExist] = useState(false)
  const [redeemable, setRedeemable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!walletAdapter.publicKey || !lootboxProgram || !stakingProgram) return

    handleStateRefresh(lootboxProgram, walletAdapter.publicKey)
  }, [walletAdapter, lootboxProgram])

  const handleOpenLootbox: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !switchboardProgram ||
        !stakingProgram
      )
        return

      openLootbox(
        connection,
        userAccountExists,
        walletAdapter.publicKey,
        lootboxProgram,
        switchboardProgram,
        stakingProgram
      )
    },
    [
      lootboxProgram,
      connection,
      walletAdapter,
      userAccountExists,
      walletAdapter,
      switchboardProgram,
      stakingProgram,
    ]
  )

  const handleRedeemLoot: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !switchboardProgram ||
        !stakingProgram
      )
        return
    },
    []
  )

  // check if UserState account exists
  // if UserState account exists also check if there is a redeemable item from lootbox
  const checkUserAccount = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    try {
      const [userStatePda] = PublicKey.findProgramAddressSync(
        [publicKey.toBytes()],
        lootboxProgram.programId
      )
      const account = await lootboxProgram.account.userState.fetch(userStatePda)
      if (account) {
        setUserAccountExist(true)
        setRedeemable(account.redeemable)
      } else {
        setRedeemable(false)
        setUserAccountExist(false)
      }
    } catch {}
  }

  const fetchLootboxPointer = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    try {
      const [lootboxPointerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("lootbox"), publicKey.toBytes()],
        LOOTBOX_PROGRAM_ID
      )

      const lootboxPointer = await lootboxProgram.account.lootboxPointer.fetch(
        lootboxPointerPda
      )
      console.log(
        "Setting available lootbox to",
        lootboxPointer.availableLootbox.toNumber()
      )
      console.log(lootboxPointer)
      setAvailableLootbox(lootboxPointer.availableLootbox.toNumber())
    } catch (error) {
      console.log(error)
      console.log("Setting available lootbox to", 10)
      setAvailableLootbox(10)
    }
  }

  const handleStateRefresh = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    checkUserAccount(lootboxProgram, publicKey)
    fetchLootboxPointer(lootboxProgram, publicKey)
  }

  const openLootbox = async (
    connection: Connection,
    userAccountExists: boolean,
    publicKey: PublicKey,
    lootboxProgram: Program<LootboxProgram>,
    switchboardProgram: SwitchboardProgram,
    stakingProgram: Program<AnchorNftStaking>
  ) => {
    if (!userAccountExists) {
      const { instructions, vrfKeypair } =
        await createInitSwitchboardInstructions(
          switchboardProgram,
          lootboxProgram,
          publicKey
        )

      const transaction = new Transaction()
      transaction.add(...instructions)
      sendAndConfirmTransaction(transaction, [vrfKeypair])
    } else {
      const instructions = await createOpenLootboxInstructions(
        connection,
        stakingProgram,
        switchboardProgram,
        lootboxProgram,
        publicKey,
        nftTokenAccount,
        availableLootbox
      )

      const transaction = new Transaction()
      transaction.add(...instructions)
      sendAndConfirmTransaction(transaction)
    }
  }

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction, signers: Keypair[] = []) => {
      setIsConfirmingTransaction(true)

      try {
        const signature = await walletAdapter.sendTransaction(
          transaction,
          connection,
          { signers: signers }
        )
        const latestBlockhash = await connection.getLatestBlockhash()
        await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: signature,
          },
          "finalized"
        )
      } catch (error) {
        console.log(error)
      } finally {
        setIsConfirmingTransaction(false)
      }

      console.log("Transaction complete")
      handleStateRefresh(lootboxProgram!, walletAdapter.publicKey!)
      fetchUpstreamState()
    },
    [walletAdapter, connection]
  )

  return (
    <Center
      height="120px"
      width="120px"
      bgColor={"containerBg"}
      borderRadius="10px"
    >
      {availableLootbox &&
      stakeAccount &&
      stakeAccount.totalEarned.toNumber() >= availableLootbox ? (
        <Button
          borderRadius="25"
          onClick={redeemable ? handleRedeemLoot : handleOpenLootbox}
          isLoading={isConfirmingTransaction}
        >
          {redeemable
            ? "Redeem"
            : userAccountExists
            ? `${availableLootbox} $BLD`
            : "Enable"}
        </Button>
      ) : (
        <Text color="bodyText">Keep Staking</Text>
      )}
    </Center>
  )
}
