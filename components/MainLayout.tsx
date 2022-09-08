import { Box, Center, Spacer, Stack } from "@chakra-ui/react"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import { useWallet } from "@solana/wallet-adapter-react"
import { FC, ReactNode, useEffect } from "react"
import NavBar from "./NavBar"

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const walletAdapter = useWallet()

  return (
    <div className={styles.container}>
      <Head>
        <title>Buildoors</title>
        <meta name="The NFT Collection for Buildoors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        w="full"
        h="calc(100vh)"
        bgImage={walletAdapter.connected ? "" : "url(/home-background.svg)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
          <NavBar />

          <Spacer />
          <Center>{children}</Center>
          <Spacer />

          <Center>
            <Box marginBottom={4} color="white">
              <a
                href="https://twitter.com/_buildspace"
                target="_blank"
                rel="noopener noreferrer"
              >
                built with @_buildspace
              </a>
            </Box>
          </Center>
        </Stack>
      </Box>
    </div>
  )
}

export default MainLayout
