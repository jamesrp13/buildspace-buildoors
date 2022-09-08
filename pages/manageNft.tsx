import { NextPage } from "next"
import {
  VStack,
  Container,
  Heading,
  Text,
  Image,
  HStack,
  Button,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { PublicKey } from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import MainLayout from "../components/MainLayout"

interface ManageNftProps {
  mint: PublicKey
}

const ManageNft: NextPage<ManageNftProps> = ({ mint }) => {
  const handleClick = useCallback(() => {}, [])
  const [metadata, setMetadata] = useState<any>()
  const { connection } = useConnection()
  const walletAdapter = useWallet()
  const metaplex = Metaplex.make(connection).use(
    walletAdapterIdentity(walletAdapter)
  )

  useEffect(() => {
    if (
      walletAdapter &&
      walletAdapter.wallet &&
      !walletAdapter.connected &&
      !walletAdapter.connecting
    ) {
      walletAdapter.connect()
    }

    metaplex
      .nfts()
      .findByMint({ mintAddress: mint })
      .run()
      .then((nft) => {
        fetch(nft.uri)
          .then((res) => res.json())
          .then((metadata) => {
            setMetadata(metadata)
          })
      })
  }, [metaplex, walletAdapter])

  return (
    <MainLayout>
      <VStack spacing={20}>
        <Container>
          <VStack spacing={8}>
            <Heading color="white" as="h1" size="2xl" textAlign="center">
              😮 A new buildoor has appeared!
            </Heading>

            <Text color="bodyText" fontSize="xl" textAlign="center">
              Congratulations, you minted a lvl 1 builder! <br />
              Time to stake your character to earn rewards and level up.
            </Text>
          </VStack>
        </Container>

        <Image src={metadata?.image ?? ""} alt="" />

        <Button
          bgColor="accent"
          color="white"
          maxW="380px"
          onClick={handleClick}
        >
          <HStack>
            <Text>stake my buildoor</Text>
            <ArrowForwardIcon />
          </HStack>
        </Button>
      </VStack>
    </MainLayout>
  )
}

ManageNft.getInitialProps = async ({ query }) => {
  const { mint } = query

  if (!mint) throw { error: "no mint" }

  const mintPubkey = new PublicKey(mint)

  return { mint: mintPubkey }
}

export default ManageNft
