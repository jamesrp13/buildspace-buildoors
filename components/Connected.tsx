import {
  Button,
  Container,
  Heading,
  VStack,
  Text,
  HStack,
  Image,
} from "@chakra-ui/react"
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { PublicKey } from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
  Metaplex,
  walletAdapterIdentity,
  CandyMachine,
} from "@metaplex-foundation/js"
import { useRouter } from "next/router"

const Connected: FC = () => {
  const { connection } = useConnection()
  const walletAdapter = useWallet()
  const [candyMachine, setCandyMachine] = useState<CandyMachine>()
  const [isMinting, setIsMinting] = useState(false)

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
  }, [connection, walletAdapter])

  useEffect(() => {
    handleInitialLoad()
  }, [metaplex, walletAdapter])

  const handleInitialLoad = useCallback(async () => {
    if (!metaplex || !walletAdapter.publicKey) return

    try {
      const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({
          address: new PublicKey(
            process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS ?? ""
          ),
        })
        .run()

      const nfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: walletAdapter.publicKey })
        .run()

      const nft = nfts.find(
        (nft) =>
          nft.collection?.address.toBase58() ===
          candyMachine.collectionMintAddress?.toBase58()
      )

      if (nft) {
        const metadata = await (await fetch(nft.uri)).json()
        router.push(
          // @ts-ignore
          `/stake?mint=${nft.mintAddress}&imageSrc=${metadata?.image}`
        )
      }

      setCandyMachine(candyMachine)
    } catch (error) {
      alert(error)
    }
  }, [metaplex, walletAdapter])

  const router = useRouter()

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (event.defaultPrevented) return

      if (!walletAdapter.connected || !candyMachine) {
        return
      }

      try {
        setIsMinting(true)
        const nft = await metaplex.candyMachines().mint({ candyMachine }).run()

        console.log(nft)
        router.push(`/newMint?mint=${nft.nft.address.toBase58()}`)
      } catch (error) {
        alert(error)
      } finally {
        setIsMinting(false)
      }
    },
    [metaplex, walletAdapter, candyMachine]
  )

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
            <Text as="b"> $BLD</Text>. Use your <Text as="b"> $BLD</Text> to
            upgrade your buildoor and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        <Image src="avatar1.png" alt="" />
        <Image src="avatar2.png" alt="" />
        <Image src="avatar3.png" alt="" />
        <Image src="avatar4.png" alt="" />
        <Image src="avatar5.png" alt="" />
      </HStack>

      <Button
        bgColor="accent"
        color="white"
        maxW="380px"
        onClick={handleClick}
        isLoading={isMinting}
      >
        <Text>mint buildoor</Text>
      </Button>
    </VStack>
  )
}

export default Connected
