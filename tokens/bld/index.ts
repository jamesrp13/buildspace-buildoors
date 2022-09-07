import * as token from "@solana/spl-token"
import * as web3 from "@solana/web3.js"
import { initializeKeypair } from "./initializeKeypair"
import * as fs from "fs"
import {
  bundlrStorage,
  findMetadataPda,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js"
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata"

const tokenName = "BUILD"
const tokenSymbol = "BLD"
const tokenDescription = "A token for buildoors"
const tokenImagePath = "tokens/bld/assets/unicorn.png"
const tokenImageFileName = "unicorn.png"

async function createBldToken(
  connection: web3.Connection,
  payer: web3.Keypair
) {
  const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    2
  )

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    )

  const imageBuffer = fs.readFileSync(tokenImagePath)
  const file = toMetaplexFile(imageBuffer, tokenImageFileName)
  const imageUri = await metaplex.storage().upload(file)
  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: tokenName,
      description: tokenDescription,
      image: imageUri,
    })
    .run()

  const metadataPda = await findMetadataPda(tokenMint)

  const tokenMetadata = {
    name: tokenName,
    symbol: tokenSymbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  )

  const transaction = new web3.Transaction()
  transaction.add(instruction)

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )

  fs.writeFileSync(
    "tokens/bld/cache.json",
    JSON.stringify({
      mint: tokenMint.toBase58(),
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda.toBase58(),
      metadataTransaction: transactionSignature,
    })
  )
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const payer = await initializeKeypair(connection)

  await createBldToken(connection, payer)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
