import type { NextPage } from "next"
import { useRouter } from "next/router"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import MainLayout from "../components/MainLayout"
import {
  Container,
  Heading,
  VStack,
  Text,
  Image,
  Button,
  HStack,
} from "@chakra-ui/react"
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ArrowForwardIcon } from "@chakra-ui/icons"
import { PublicKey } from "@solana/web3.js"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { useWorkspace } from "../context/Anchor"

const NewMint: NextPage<NewMintProps> = ({ mint }) => {
  const [nftData, setNftData] = useState<any>()
  const [isStaking, setIsStaking] = useState(false)
  const { connection } = useConnection()
  const walletAdapter = useWallet()
  const { sendTransaction } = useWallet()
  const workspace = useWorkspace()
  const program = workspace.program

  // metaplex setup
  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
  }, [connection, walletAdapter])
  const router = useRouter()

  const handleClick: MouseEventHandler<HTMLButtonElement> =
    useCallback(async () => {
      if (program) {
        // get token account of NFT
        const tokenAccount = (await connection.getTokenLargestAccounts(mint))
          .value[0].address

        // create stake transaction
        const transaction = await program.methods
          .stake()
          .accounts({
            nftTokenAccount: tokenAccount,
            nftMint: mint,
            nftEdition: nftData.edition.address,
            metadataProgram: METADATA_PROGRAM_ID,
          })
          .transaction()

        try {
          setIsStaking(true)

          // send transaction
          const transactionSignature = await sendTransaction(
            transaction,
            connection
          )

          // wait for transaction confirmation
          const latestBlockHash = await connection.getLatestBlockhash()
          await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: transactionSignature,
          })

          console.log("Stake tx:")
          console.log(
            `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
          )
        } catch (error) {
          alert(error)
        }

        // push to new page
        router.push(`/stake?mint=${mint}&imageSrc=${nftData?.json.image}`)
      }
    }, [router, mint, nftData])

  useEffect(() => {
    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) })
      .run()
      .then((nft) => {
        setNftData(nft)
      })
  }, [mint, metaplex])

  return (
    <MainLayout>
      <VStack spacing={20}>
        <Container>
          <VStack spacing={8}>
            <Heading color="white" as="h1" size="2xl" textAlign="center">
              😮 A new buildoor has appeared!
            </Heading>

            <Text color="bodyText" fontSize="xl" textAlign="center">
              Congratulations, you minted a lvl 1 buildoor! <br />
              Time to stake your character to earn rewards and level up.
            </Text>
          </VStack>
        </Container>

        <Image src={nftData?.json.image ?? ""} alt="" />

        <Button
          bgColor="accent"
          color="white"
          maxW="380px"
          onClick={handleClick}
          isLoading={isStaking}
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

interface NewMintProps {
  mint: PublicKey
}

NewMint.getInitialProps = async ({ query }) => {
  const { mint } = query

  if (!mint) throw { error: "no mint" }

  try {
    const mintPubkey = new PublicKey(mint)
    return { mint: mintPubkey }
  } catch {
    throw { error: "invalid mint" }
  }
}

export default NewMint
