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
import { PublicKey } from "@solana/web3.js"

const candyMachineAddress = new PublicKey(
  "5sAHQFz9xhHwu7gioMmKgBcN4prdponx7EEHcSZyqys7"
)

const Connected: FC = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

  const [candyMachine, setCandyMachineData] = useState<CandyMachine>()
  const [pageItems, setPageItems] = useState<any[]>()
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const perPage = 3

  const mint = async () => {
    if (!wallet.connected || !candyMachine) {
      return
    }
    console.log("test")

    try {
      const nft = await metaplex.candyMachines().mint({ candyMachine }).run()
      console.log(nft)
      alert("Successful Mint")
    } catch (e) {
      // alert("")
    }
  }

  const fetchCandyMachine = async () => {
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: candyMachineAddress })
      .run()

    console.log(candyMachine)

    setCandyMachineData(candyMachine)
    setTotalItems(candyMachine.items.length)
  }

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

  useEffect(() => {
    fetchCandyMachine()
  }, [])

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

  useEffect(() => {
    getPage(page, perPage)
  }, [candyMachine, page])

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

      {/* <HStack spacing={10}>
        <Image src="avatar1.png" alt="" />
        <Image src="avatar2.png" alt="" />
        <Image src="avatar3.png" alt="" />
        <Image src="avatar4.png" alt="" />
        <Image src="avatar5.png" alt="" />
      </HStack> */}

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
