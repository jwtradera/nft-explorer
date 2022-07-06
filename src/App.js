import { CandyMachine, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getMintAddresses, getNfts } from "./utils";

const connection = new Connection("https://solana-api.projectserum.com");
const mx = Metaplex.make(connection);

function App() {
  const display_len = 12;
  const [candymachineAddr, setCandymachineAddr] = useState("");
  const [candymachine, setCandymachine] = useState(null);
  const [mints, setMints] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadNFT, setLoadNFT] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCandymachineAddr(value);
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const searchCandymachine = async () => {
      try {
        setLoading(true);

        const candymachineKey = new PublicKey(candymachineAddr);
        const _candymachine = await mx
          .candyMachines()
          .findByAddress(candymachineKey);
        setCandymachine(_candymachine);

        setErrorMsg("");
        setLoading(false);
      } catch (ex) {
        setErrorMsg("Get error while search candymachine.");
        setLoading(false);
      }
    };

    searchCandymachine();
  };

  useEffect(() => {
    const searchMints = async () => {
      if (candymachine) {
        setLoading(true);
        const _mints = await getMintAddresses(
          connection,
          candymachine.candyMachineAddress
        );
        setMints(_mints);
        setLoading(false);
      }
    };

    searchMints();
  }, [candymachine]);

  useEffect(() => {
    const searchNfts = async (addresses) => {
      setLoadNFT(true);
      let _nfts = [];
      for (const address of addresses) {
        _nfts.push(await mx.nfts().findByMint(address));
      }

      setNfts(_nfts);
      setLoadNFT(false);
    };

    console.log(offset);
    if (mints && mints.length > 0) {
      searchNfts(mints.slice(offset, offset + display_len));
    }
  }, [offset, mints]);

  const handleNext = () => {
    setOffset(offset + display_len);
  };

  const handlePrev = () => {
    setOffset(offset - display_len < 0 ? 0 : offset - display_len);
  };
  return (
    <div className="relative">
      <div className="bg-zinc-700 p-4 shadow">
        <h1 className="text-2xl text-white">Solana NFT Explorer</h1>
      </div>

      <div className="container mx-auto">
        <div className="flex gap-4 lg:p-8 p-4">
          <input
            type="text"
            className="text-black text-xl border border-gray-400 rounded-xl px-4 py-2 w-full"
            placeholder="Input candymachine address..."
            name="candymachineAddr"
            value={candymachineAddr}
            onChange={handleInput}
            onKeyDown={handleKeydown}
          />
          <button
            type="button"
            className="bg-slate-400 text-white border border-gray-400 rounded-xl px-4 cursor-pointer hover:border-gray-200"
            onClick={handleSearch}
            disabled={loading}
          >
            {!loading ? "Search" : "Searching..."}
          </button>
        </div>

        <div className="w-full lg:px-8 px-4">
          {errorMsg ? (
            <p className="text-red-500 text-center">{errorMsg}</p>
          ) : candymachine ? (
            <div className="block">
              <h1 className="text-2xl text-black my-4">
                CandyMachine Information
              </h1>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                <div className="block">
                  <strong>Symbol</strong>
                  <p>{candymachine.symbol.trim()}</p>
                </div>
                <div className="block">
                  <strong>Mint Price</strong>
                  <p>{candymachine.price.toNumber()} SOL</p>
                </div>
                <div className="block">
                  <strong>Live Date</strong>
                  <p>{Date(candymachine.goLiveDate.toNumber()).toString()}</p>
                </div>
                <div className="block">
                  <strong>Max Supply</strong>
                  <p>{candymachine.maxSupply.toNumber()}</p>
                </div>
                <div className="block">
                  <strong>Available Items</strong>
                  <p>{candymachine.itemsAvailable.toNumber()}</p>
                </div>
                <div className="block">
                  <strong>Redeemed Items</strong>
                  <p>{candymachine.itemsRedeemed.toNumber()}</p>
                </div>
                <div className="block">
                  <strong>Secondary Fee</strong>
                  <p>{candymachine.sellerFeeBasisPoints / 100}%</p>
                </div>
                <div className="block">
                  <strong>Creators</strong>
                  {candymachine.creators.map((creator, idx) => (
                    <p key={idx}>{creator.address.toString()}</p>
                  ))}
                </div>
              </div>
              <div className="flex justify-between my-4">
                <h1 className="text-2xl text-black">Related NFTs</h1>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-slate-400 text-white border border-gray-400 rounded-xl px-4 cursor-pointer hover:border-gray-200"
                    onClick={handlePrev}
                    disabled={loading}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="bg-slate-400 text-white border border-gray-400 rounded-xl px-4 cursor-pointer hover:border-gray-200"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next
                  </button>
                </div>
              </div>
              {loadNFT ? (
                <div className="text-center">Loading NFT...</div>
              ) : (
                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
                  {nfts.map((nft, idx) => (
                    <div
                      className="border rounded-xl border-gray-400 p-4"
                      key={idx}
                    >
                      <img src={nft.metadata.image} alt={nft.name} />
                      <strong>{nft.name}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
