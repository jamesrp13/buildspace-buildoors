import { PublicKey } from "@solana/web3.js"

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_PROGRAM_ID ?? ""
)

export const STAKE_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_MINT_ADDRESS ?? ""
)

export const LOOTBOX_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_LOOTBOX_PROGRAM_ID ?? ""
)

const gearOptions = JSON.parse(process.env.NEXT_PUBLIC_GEAR_OPTIONS ?? "") as [
  string
]
export const GEAR_OPTIONS = gearOptions.map((x) => new PublicKey(x))
