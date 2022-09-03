import { FC, useState, useEffect } from "react"
import {
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react"
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { collectionAddress } from "../utils/constants"

const DisplayNFT: FC = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

  const [nftData, setNftData] = useState<any[]>()

  // fetch nfts for connected wallet
  const fetchNfts = async () => {
    if (!wallet.connected) {
      return
    }

    const nfts = await metaplex
      .nfts()
      .findAllByOwner({ owner: wallet.publicKey! })
      .run()

    // only fetch uri metadata for nfts in collection
    let nftData = []
    for (let i = 0; i < nfts.length; i++) {
      if (
        nfts[i].collection?.address.toString() == collectionAddress.toString()
      ) {
        let fetchResult = await fetch(nfts[i].uri)
        let json = await fetchResult.json()
        nftData.push(json)
      }
    }

    setNftData(nftData)
  }

  // fetch nfts when wallet changes
  useEffect(() => {
    fetchNfts()
  }, [wallet])

  return (
    <VStack spacing={20}>
      <Container>
        <VStack spacing={8}>
          <Heading
            color="white"
            as="h1"
            size="2xl"
            noOfLines={1}
            textAlign="center"
          >
            My Buildoors.
          </Heading>

          <Text color="bodyText" fontSize="xl" textAlign="center">
            Mint to see your Buildoor!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        {nftData?.map((nft) => (
          <Image
            key={nft.address}
            borderRadius="md"
            boxSize="250px"
            src={nft.image}
            alt=""
          />
        ))}
      </HStack>
    </VStack>
  )
}

export default DisplayNFT
