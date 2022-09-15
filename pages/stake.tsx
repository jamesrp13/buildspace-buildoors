import { ReactNode } from "react"
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
  Container,
} from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
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

const Stake: NextPage<StakeProps> = ({
  mint,
  totalEarned,
  claimable,
  imageSrc,
  isStaking,
  level,
  daysStaked,
}) => {
  const connection = useMetaplexConnection()

  const handleClaim = () => {}
  const handleStake = () => {}

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
          Stake your buildoor to earn 10 $BLD per day to get access to a
          randomized loot box full of upgrades for your buildoor
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
                {isStaking
                  ? `STAKING ${daysStaked} DAY${daysStaked === 1 ? "" : "S"}`
                  : "READY TO STAKE"}
              </Text>
              <VStack spacing={-1}>
                <Text color="white" as="b" fontSize="4xl">
                  {isStaking ? `${totalEarned} $BLD` : "0 $BLD"}
                </Text>
                <Text color="bodyText">
                  {isStaking
                    ? `${claimable} $BLD earned`
                    : "earn $BLD by staking"}
                </Text>
              </VStack>
              <Button
                onClick={isStaking ? handleClaim : handleStake}
                bgColor="buttonGreen"
                width="200px"
              >
                <Text as="b">
                  {isStaking ? "claim $BLD" : "stake buildoor"}
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
    </MainLayout>
  )
}

interface StakeProps {
  mint: PublicKey
  isStaking: boolean
  totalEarned: number
  claimable: number
  imageSrc: string
  level: number
  daysStaked: number
}

Stake.getInitialProps = async ({ query }: any) => {
  const { mint, imageSrc } = query

  if (!mint) throw { error: "no mint" }

  try {
    const mintPubkey = new PublicKey(mint)
    return {
      mint: mintPubkey,
      totalEarned: 420,
      claimable: 69,
      isStaking: true,
      level: 1,
      daysStaked: 4,
      imageSrc,
    }
  } catch {
    throw { error: "invalid mint" }
  }
}

export default Stake
