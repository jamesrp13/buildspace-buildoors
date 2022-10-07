import { Center, Image, VStack, Text } from "@chakra-ui/react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

export const ItemBox = ({
  item,
  balance,
}: {
  item: string
  balance: number
}) => {
  const [metadata, setMetadata] = useState<any>()
  const { connection } = useConnection()
  const walletAdapter = useWallet()

  useEffect(() => {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    )

    const mint = new PublicKey(item)

    try {
      metaplex
        .nfts()
        .findByMint({ mintAddress: mint })
        .run()
        .then((nft) => {
          setMetadata(nft)
        })
    } catch (error) {
      console.log("error getting gear token:", error)
    }
  }, [item, connection, walletAdapter])

  return (
    <VStack>
      <Center
        height="120px"
        width="120px"
        bgColor={"containerBg"}
        borderRadius="10px"
      >
        {metadata && <Image src={metadata.image} />}
      </Center>
      <Text>{`x${balance}`}</Text>
    </VStack>
  )
}
