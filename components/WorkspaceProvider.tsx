import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import {
  AnchorNftStaking,
  IDL as stakingIdl,
} from "../utils/anchor_nft_staking"
import { Connection } from "@solana/web3.js"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import MockWallet from "./MockWallet"
import { LOOTBOX_PROGRAM_ID, PROGRAM_ID } from "../utils/constants"
import { LootboxProgram, IDL as lootboxIdl } from "../utils/lootbox_program"
import {
  SwitchboardProgram,
  AnchorWallet,
  loadSwitchboardProgram,
} from "@switchboard-xyz/switchboard-v2"

const WorkspaceContext = createContext({})
const programId = PROGRAM_ID
const lootboxProgramId = LOOTBOX_PROGRAM_ID

interface Workspace {
  connection?: Connection
  provider?: AnchorProvider
  stakingProgram?: Program<AnchorNftStaking>
  lootboxProgram?: Program<LootboxProgram>
  switchboardProgram?: SwitchboardProgram
}

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet
  const { connection } = useConnection()

  const provider = new AnchorProvider(connection, wallet, {})
  setProvider(provider)

  const stakingProgram = useMemo(
    () => new Program(stakingIdl as Idl, programId),
    []
  )
  const lootboxProgram = useMemo(
    () => new Program(lootboxIdl as Idl, lootboxProgramId),
    []
  )

  const [switchboardProgram, setSwitchboardProgram] =
    useState<SwitchboardProgram>()

  useEffect(() => {
    loadSwitchboardProgram(
      "devnet",
      connection,
      ((provider as AnchorProvider).wallet as AnchorWallet).payer
    ).then((program) => setSwitchboardProgram(program))
  }, [connection])

  const workspace = useMemo(() => {
    return {
      connection: connection,
      provider: provider,
      stakingProgram: stakingProgram,
      lootboxProgram: lootboxProgram,
      switchboardProgram: switchboardProgram,
    }
  }, [stakingProgram, lootboxProgram, connection, provider, switchboardProgram])

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

const useWorkspace = (): Workspace => {
  return useContext(WorkspaceContext)
}

export { WorkspaceProvider, useWorkspace }
