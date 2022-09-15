import { createContext, useContext, useMemo, FC, ReactNode } from "react"
import { Metaplex } from "@metaplex-foundation/js"
import { useConnection } from "@solana/wallet-adapter-react"

const MetaplexContext = createContext<any | null>(null)

const MetaplexProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection()
  const metaplex = useMemo(() => {
    return Metaplex.make(connection)
  }, [connection])

  return (
    <MetaplexContext.Provider value={metaplex}>
      {children}
    </MetaplexContext.Provider>
  )
}

export const useMetaplexConnection = () => {
  return useContext(MetaplexContext)
}

export default MetaplexProvider
