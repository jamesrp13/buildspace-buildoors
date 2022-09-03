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
import {
  CandyMachine,
  Metaplex,
  walletAdapterIdentity,
} from "@metaplex-foundation/js"
import { candyMachineAddress } from "../utils/constants"

const Connected: FC = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

  const [candyMachine, setCandyMachineData] = useState<CandyMachine>()
  const [pageItems, setPageItems] = useState<any[]>()
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const perPage = 3

  // mint from candymachine
  const mint = async () => {
    if (!wallet.connected || !candyMachine) {
      return
    }

    try {
      const nft = await metaplex.candyMachines().mint({ candyMachine }).run()
      console.log(nft)
      alert("Successful Mint")
    } catch (e) {
      // alert("")
    }
  }

  // fetch candymachine
  const fetchCandyMachine = async () => {
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: candyMachineAddress })
      .run()

    console.log(candyMachine)

    setCandyMachineData(candyMachine)
    setTotalItems(candyMachine.items.length)
  }

  // display candymachine NFT images for current page
  const getPage = async (page: number, perPage: number) => {
    if (candyMachine) {
      const pageItems = candyMachine.items.slice(
        (page - 1) * perPage,
        page * perPage
      )

      let nftData = []
      for (let i = 0; i < pageItems.length; i++) {
        let fetchResult = await fetch(pageItems[i].uri)
        let json = await fetchResult.json()
        nftData.push(json)
      }

      setPageItems(nftData)
    }
  }

  // previous page
  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1)
    } else {
      setPage(page - 1)
    }
  }

  // next page
  const next = async () => {
    if (totalItems > page * perPage) {
      setPage(page + 1)
    }
  }

  // paging
  useEffect(() => {
    getPage(page, perPage)
  }, [candyMachine, page])

  // fetch candymachine
  useEffect(() => {
    fetchCandyMachine()
  }, [])

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
            Welcome Buildoor.
          </Heading>

          <Text color="bodyText" fontSize="xl" textAlign="center">
            Each buildoor is randomly generated and can be staked to receive
            <Text as="b"> $BLD</Text> Use your <Text as="b"> $BLD</Text> to
            upgrade your buildoor and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        <Button bgColor="accent" color="white" maxW="380px" onClick={prev}>
          <ArrowBackIcon />
        </Button>
        {pageItems?.map((nft) => (
          <Image
            key={nft.address}
            borderRadius="md"
            boxSize="250px"
            src={nft.image}
            alt=""
          />
        ))}
        <Button bgColor="accent" color="white" maxW="380px" onClick={next}>
          <ArrowForwardIcon />
        </Button>
      </HStack>

      <Button bgColor="accent" color="white" maxW="380px" onClick={mint}>
        <HStack>
          <Text>mint buildoor</Text>
          <ArrowForwardIcon />
        </HStack>
      </Button>
    </VStack>
  )
}

export default Connected
