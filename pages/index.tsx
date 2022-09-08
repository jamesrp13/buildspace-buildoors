import { Box, Center, Spacer, Stack } from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import Disconnected from "../components/Disconnected"
import NavBar from "../components/NavBar"
import { useWallet } from "@solana/wallet-adapter-react"
import Connected from "../components/Connected"
import MainLayout from "../components/MainLayout"

const Home: NextPage = () => {
  const { connected } = useWallet()

  return <MainLayout>{connected ? <Connected /> : <Disconnected />}</MainLayout>
}

export default Home
