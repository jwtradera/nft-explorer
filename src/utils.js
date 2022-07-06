import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const TOKEN_METADATA_PROGRAM = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const CANDY_MACHINE_V2_PROGRAM = new PublicKey(
  "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE =
  4 +
  MAX_NAME_LENGTH +
  4 +
  MAX_SYMBOL_LENGTH +
  4 +
  MAX_URI_LENGTH +
  2 +
  1 +
  4 +
  MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_ARRAY_START =
  1 +
  32 +
  32 +
  4 +
  MAX_NAME_LENGTH +
  4 +
  MAX_URI_LENGTH +
  4 +
  MAX_SYMBOL_LENGTH +
  2 +
  1 +
  4;

export const getMintAddresses = async (connection, candyMachineId) => {
  const candyMachineCreators = await PublicKey.findProgramAddress(
    [Buffer.from("candy_machine"), candyMachineId.toBuffer()],
    CANDY_MACHINE_V2_PROGRAM
  );
  const creatorAddress = candyMachineCreators[0];

  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      dataSlice: { offset: 33, length: 32 },

      filters: [
        { dataSize: MAX_METADATA_LEN },
        {
          memcmp: {
            offset: CREATOR_ARRAY_START,
            bytes: creatorAddress.toBase58(),
          },
        },
      ],
    }
  );

  return metadataAccounts.map(
    (metadataAccountInfo) =>
      new PublicKey(bs58.encode(metadataAccountInfo.account.data))
  );
};