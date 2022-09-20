import { ReactNode, useEffect, useState, useMemo, useCallback } from "react"
import type { NextPage } from "next"
import MainLayout from "../components/MainLayout"
import {
  Heading,
  VStack,
  Text,
  Image,
  Center,
  Button,
  HStack,
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { PublicKey, Transaction } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { getStakeAccount } from "../utils/accounts"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import {
  createStakeInstruction,
  createUnstakeInstruction,
  createRedeemInstruction,
} from "../utils/instructions"
import { STAKE_MINT } from "../utils/constants"

// unused metaplex context
import { useMetaplexConnection } from "../components/MetaplexProvider"

const ItemBox = ({
  children,
  bgColor,
}: {
  children: ReactNode
  bgColor?: string
}) => {
  return (
    <Center
      height="120px"
      width="120px"
      bgColor={bgColor || "containerBg"}
      borderRadius="10px"
    >
      {children}
    </Center>
  )
}

const Stake: NextPage<StakeProps> = ({ mint, imageSrc, level }) => {
  const [nftData, setNftData] = useState<any>()
  const [tokenAccountAddress, setTokenAccountAddress] = useState<PublicKey>()
  const [stakeState, setStakeState] = useState<any>()
  const [isStaking, setIsStaking] = useState(false)
  const [stakeRewards, setStakeRewards] = useState(0)
  const [stakeTime, setStakeTime] = useState(String)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const walletAdapter = useWallet()

  // metaplex setup
  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
  }, [connection, walletAdapter])

  // stake instruction
  const handleStake = async () => {
    if (publicKey && tokenAccountAddress) {
      // create stake instruction
      const stakeInstruction = createStakeInstruction(
        publicKey,
        tokenAccountAddress,
        nftData.mint.address,
        nftData.edition.address
      )

      // add instruction to transaction
      const transaction = new Transaction().add(stakeInstruction)

      // helper function to send and confirm transaction
      sendAndConfirmTransaction(transaction)
    }
  }

  // unstake instruction
  const handleUnstake = async () => {
    if (publicKey && tokenAccountAddress) {
      const transaction = new Transaction()

      // get stake rewards token address
      const stakeRewardTokenAddress = await getAssociatedTokenAddress(
        STAKE_MINT,
        publicKey
      )

      // create token account instruction
      const createTokenAccountInstruction =
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          stakeRewardTokenAddress, // token address
          publicKey, // token owner
          STAKE_MINT // token mint
        )

      try {
        // check if token account already exists
        await getAccount(
          connection, // connection
          stakeRewardTokenAddress // token address
        )
      } catch (error: unknown) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          try {
            // add instruction to create token account if one does not exist
            transaction.add(createTokenAccountInstruction)
          } catch (error: unknown) {}
        } else {
          throw error
        }
      }

      // unstake instruction
      const unstakeInstruction = createUnstakeInstruction(
        publicKey,
        tokenAccountAddress,
        nftData.mint.address,
        nftData.edition.address,
        stakeRewardTokenAddress
      )

      // add instruction to transaction
      transaction.add(unstakeInstruction)

      // helper function to send and confirm transaction
      sendAndConfirmTransaction(transaction)
    }
  }

  // redeem instruction
  const handleRedeem = async () => {
    if (publicKey && tokenAccountAddress) {
      const transaction = new Transaction()

      // get stake rewards token address
      const stakeRewardTokenAddress = await getAssociatedTokenAddress(
        STAKE_MINT,
        publicKey
      )

      // create token account instruction
      const createTokenAccountInstruction =
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          stakeRewardTokenAddress, // token address
          publicKey, // token owner
          STAKE_MINT // token mint
        )

      try {
        // check if token account already exists
        await getAccount(
          connection, // connection
          stakeRewardTokenAddress // token address
        )
      } catch (error: unknown) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          try {
            // add instruction to create token account if one does not exist
            transaction.add(createTokenAccountInstruction)
          } catch (error: unknown) {}
        } else {
          throw error
        }
      }

      // redeem instruction
      const redeemInstruction = createRedeemInstruction(
        publicKey,
        tokenAccountAddress,
        stakeRewardTokenAddress
      )

      // add transaction to instruction
      transaction.add(redeemInstruction)

      // helper function to send and confirm transaction
      sendAndConfirmTransaction(transaction)
    }
  }

  // helper function to send and confirm transaction
  const sendAndConfirmTransaction = async (transaction: Transaction) => {
    try {
      // send transaction
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      )

      // open loading modal
      onOpen()

      // wait for transaction confirmation
      // using "finalized" otherwise switching between staking / unstaking sometimes doesn't work and redeem amount not updated correctly
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: transactionSignature,
        },
        "finalized"
      )

      // close loading modal once transaction confirmation finalized
      onClose()

      console.log(
        `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
      )

      // check status of stateState
      checkStakeStatus()
    } catch (error) {}
  }

  // fetch NFT data
  const fetchNft = async () => {
    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) })
      .run()
      .then((nft) => {
        setNftData(nft)
      })

    const tokenAccount = (
      await connection.getTokenLargestAccounts(new PublicKey(mint))
    ).value[0].address

    setTokenAccountAddress(tokenAccount)
  }

  // check stake status of NFT
  const checkStakeStatus = async () => {
    if (publicKey && tokenAccountAddress) {
      // helper function to deserialize stake account
      const stakeAccount = await getStakeAccount(
        connection,
        publicKey,
        tokenAccountAddress
      )

      setStakeState(stakeAccount)

      if (stakeAccount.stakeState == 0) {
        setIsStaking(true)
      } else {
        setIsStaking(false)
      }
    }
  }

  // calculate stake rewards
  const checkStakeRewards = async () => {
    if (stakeState) {
      // get current solana clock time
      const slot = await connection.getSlot({ commitment: "confirmed" })
      const timestamp = await connection.getBlockTime(slot)
      const rewards = timestamp! - stakeState.lastStakeRedeem.toNumber()
      const duration = timestamp! - stakeState.stakeStartTime.toNumber()
      convert(duration)

      // calculate accumulated staking rewards
      setStakeRewards(rewards)
    }
  }

  // convert total time staked to string for display
  const convert = async (time: number) => {
    setStakeTime(
      Math.floor(time / 24 / 60) +
        " HR : " +
        Math.floor((time / 60) % 24) +
        " MIN : " +
        Math.floor(time % 60) +
        " SEC "
    )
  }

  // fetch NFT data
  useEffect(() => {
    fetchNft()
  }, [mint])

  // check stake status
  useEffect(() => {
    checkStakeStatus()
  }, [tokenAccountAddress])

  // check stake rewards
  useEffect(() => {
    if (isStaking) {
      const interval = setInterval(() => {
        checkStakeRewards()
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setStakeRewards(0)
    }
  }, [isStaking, stakeState])

  return (
    <MainLayout centered={false} topAlign={true}>
      <VStack
        spacing={7}
        justify="flex-start"
        align="flex-start"
        paddingLeft="40px"
      >
        <Heading color="white" as="h1" size="2xl">
          Level up your buildoor
        </Heading>
        <Text color="bodyText" fontSize="xl" textAlign="start" maxWidth="600px">
          Stake your buildoor to earn $BLD and get access to a randomized loot
          box full of upgrades for your buildoor
        </Text>
        <HStack spacing={20} alignItems="flex-start">
          <VStack align="flex-start" minWidth="200px">
            <Flex direction="column">
              <Image src={imageSrc ?? ""} alt="buildoor nft" zIndex="1" />
              <Center
                bgColor="secondaryPurple"
                borderRadius="0 0 8px 8px"
                marginTop="-8px"
                zIndex="2"
                height="32px"
              >
                <Text
                  color="white"
                  as="b"
                  fontSize="md"
                  width="100%"
                  textAlign="center"
                >
                  {isStaking ? "STAKING" : "UNSTAKED"}
                </Text>
              </Center>
            </Flex>
            <Text fontSize="2xl" as="b" color="white">
              LEVEL {level}
            </Text>
          </VStack>
          <VStack alignItems="flex-start" spacing={10}>
            <VStack
              bgColor="containerBg"
              borderRadius="20px"
              padding="20px 40px"
              spacing={5}
            >
              <Text
                bgColor="containerBgSecondary"
                padding="4px 8px"
                borderRadius="20px"
                color="bodyText"
                as="b"
                fontSize="sm"
              >
                {isStaking ? `${stakeTime}` : "READY TO STAKE"}
              </Text>
              <VStack spacing={-1}>
                <Text color="white" as="b" fontSize="4xl">
                  {isStaking ? `${stakeRewards} $BLD` : "0 $BLD"}
                </Text>
              </VStack>
              {isStaking ? (
                <Button
                  onClick={handleRedeem}
                  bgColor="buttonGreen"
                  width="200px"
                >
                  <Text as="b">Redeem $BLD</Text>
                </Button>
              ) : (
                <Text color="bodyText" as="b">
                  Earn $BLD by Staking
                </Text>
              )}
              <Button
                onClick={isStaking ? handleUnstake : handleStake}
                bgColor="buttonGreen"
                width="200px"
              >
                <Text as="b">
                  {isStaking ? "Unstake buildoor" : "Stake buildoor"}
                </Text>
              </Button>
            </VStack>
            <HStack spacing={10}>
              <VStack alignItems="flex-start">
                <Text color="white" as="b" fontSize="2xl">
                  Gear
                </Text>
                <HStack>
                  <ItemBox>mock</ItemBox>
                  <ItemBox>mock</ItemBox>
                </HStack>
              </VStack>
              <VStack alignItems="flex-start">
                <Text color="white" as="b" fontSize="2xl">
                  Loot Boxes
                </Text>
                <HStack>
                  <ItemBox>mock</ItemBox>
                  <ItemBox>mock</ItemBox>
                  <ItemBox>mock</ItemBox>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent width="275px" height="150px">
          <ModalHeader>Waiting Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              <Spinner
                thickness="10px"
                speed="1.5s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </MainLayout>
  )
}

interface StakeProps {
  mint: PublicKey
  imageSrc: string
  level: number
}

Stake.getInitialProps = async ({ query }: any) => {
  const { mint, imageSrc } = query

  if (!mint) throw { error: "no mint" }

  try {
    const mintPubkey = new PublicKey(mint)
    return {
      mint: mintPubkey,
      level: 1,
      imageSrc,
    }
  } catch {
    throw { error: "invalid mint" }
  }
}

export default Stake
