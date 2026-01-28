"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Heart,
  Bitcoin,
  Check,
  Copy,
  Wallet,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const Donate = () => {
  const [copiedField, setCopiedField] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("eth");
  const [processing, setProcessing] = useState(false);
  const [showAllCoins, setShowAllCoins] = useState(false);

  const ERC20_WALLET = "0x07F2e0Bdb731Ddf816Df2295d6B1DeF64cB8A0Ac";
  const BTC_ADDRESS = "bc1q4prxph40ac7r4f3z4fh6rdmhrzy97cmmwctxzn";
  const paymentLink = "https://pmny.in/2IylBJVV7apa";

  // Trocador AnonPay links (address at the end)
  // Correct Trocador AnonPay links
  const trocadorETH =
    "https://trocador.app/anonpay/?ticker_to=eth&network_to=ERC20&address=0x07F2e0Bdb731Ddf816Df2295d6B1DeF64cB8A0Ac&donation=True&simple_mode=True&name=EducationalHub&description=Donation&bgcolor=True";

  const trocadorBTC =
    "https://trocador.app/anonpay/?ticker_to=btc&network_to=Mainnet&address=bc1q4prxph40ac7r4f3z4fh6rdmhrzy97cmmwctxzn&donation=True&simple_mode=True&name=EducationalHub&description=Donation&bgcolor=True";

  const trocadorUSDT =
    "https://trocador.app/anonpay/?ticker_to=usdt&network_to=ERC20&address=0x07F2e0Bdb731Ddf816Df2295d6B1DeF64cB8A0Ac&donation=True&simple_mode=True&name=EducationalHub&description=Donation&bgcolor=True";

  // Popular cryptocurrencies for quick access
  const popularCryptos = [
    { symbol: "ETH", name: "Ethereum", network: "ERC20" },
    { symbol: "USDT", name: "Tether", network: "ERC20" },
    { symbol: "USDC", name: "USD Coin", network: "ERC20" },
    { symbol: "BNB", name: "Binance Coin", network: "ERC20" },
  ];

  // All supported ERC20 tokens
  const allSupportedCoins = [
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDT", name: "Tether" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "BNB", name: "Binance Coin" },
    { symbol: "SHIB", name: "Shiba Inu" },
    { symbol: "OP", name: "Optimism" },
    { symbol: "ARB", name: "Arbitrum" },
    { symbol: "GRT", name: "The Graph" },
    { symbol: "PEPE", name: "Pepe" },
    { symbol: "1INCH", name: "1inch" },
    { symbol: "AAVE", name: "Aave" },
    { symbol: "ADX", name: "Ambire AdEx" },
    { symbol: "AEVO", name: "Aevo" },
    { symbol: "ALICE", name: "My Neighbor Alice" },
    { symbol: "ALT", name: "Altlayer" },
    { symbol: "AMP", name: "Amp" },
    { symbol: "ANKR", name: "Ankr" },
    { symbol: "APE", name: "ApeCoin" },
    { symbol: "API3", name: "API3" },
    { symbol: "ARKM", name: "Arkham" },
    { symbol: "ARPA", name: "ARPA" },
    { symbol: "AUCTION", name: "Bounce Token" },
    { symbol: "AUDIO", name: "Audius" },
    { symbol: "AXL", name: "Axelar" },
    { symbol: "AXS", name: "Axie Infinity" },
    { symbol: "BANANA", name: "Banana Gun" },
    { symbol: "BAND", name: "Band Protocol" },
    { symbol: "BAT", name: "Basic Attention Token" },
    { symbol: "BICO", name: "Biconomy" },
    { symbol: "BLUR", name: "Blur" },
    { symbol: "C98", name: "Coin98" },
    { symbol: "CELR", name: "Celer Network" },
    { symbol: "CHR", name: "Chromia" },
    { symbol: "CHZ", name: "Chiliz" },
    { symbol: "COMP", name: "Compound" },
    { symbol: "COTI", name: "COTI" },
    { symbol: "COW", name: "CoW Protocol" },
    { symbol: "CRV", name: "Curve DAO Token" },
    { symbol: "CTSI", name: "Cartesi" },
    { symbol: "CVX", name: "Convex Finance" },
    { symbol: "CYBER", name: "Cyber" },
    { symbol: "DAI", name: "Dai" },
    { symbol: "DEXE", name: "DeXe" },
    { symbol: "DIA", name: "DIA" },
    { symbol: "EIGEN", name: "EigenLayer" },
    { symbol: "ELF", name: "aelf" },
    { symbol: "ENA", name: "Ethena" },
    { symbol: "ENJ", name: "Enjin Coin" },
    { symbol: "ENS", name: "Ethereum Name Service" },
    { symbol: "ETHFI", name: "ether.fi" },
    { symbol: "FXS", name: "Frax Share" },
    { symbol: "GALA", name: "Gala" },
    { symbol: "GLM", name: "Golem" },
    { symbol: "GMT", name: "STEPN" },
    { symbol: "GNO", name: "Gnosis" },
    { symbol: "GTC", name: "Gitcoin" },
    { symbol: "ID", name: "SPACE ID" },
    { symbol: "ILV", name: "Illuvium" },
    { symbol: "IMX", name: "ImmutableX" },
    { symbol: "JASMY", name: "JasmyCoin" },
    { symbol: "KNC", name: "Kyber Network" },
    { symbol: "LDO", name: "Lido DAO" },
    { symbol: "LINK", name: "Chainlink" },
    { symbol: "LPT", name: "Livepeer" },
    { symbol: "LQTY", name: "Liquity" },
    { symbol: "LRC", name: "Loopring" },
    { symbol: "MANA", name: "Decentraland" },
    { symbol: "MASK", name: "Mask Network" },
    { symbol: "MEME", name: "Memecoin" },
    { symbol: "METIS", name: "Metis" },
    { symbol: "MOVE", name: "Movement" },
    { symbol: "NEIRO", name: "First Neiro On Ethereum" },
    { symbol: "NEXO", name: "Nexo" },
    { symbol: "NKN", name: "NKN" },
    { symbol: "NMR", name: "Numeraire" },
    { symbol: "OGN", name: "Origin Protocol" },
    { symbol: "OM", name: "MANTRA" },
    { symbol: "OMG", name: "OmiseGO" },
    { symbol: "PERP", name: "Perpetual Protocol" },
    { symbol: "PHA", name: "Phala Network" },
    { symbol: "PIXEL", name: "Pixels" },
    { symbol: "POWR", name: "Power Ledger" },
    { symbol: "PYR", name: "Vulcan Forged" },
    { symbol: "QKC", name: "QuarkChain" },
    { symbol: "QNT", name: "Quant" },
    { symbol: "REN", name: "Republic Protocol" },
    { symbol: "REQ", name: "Request" },
    { symbol: "REZ", name: "Renzo" },
    { symbol: "RLC", name: "iExec RLC" },
    { symbol: "RPL", name: "Rocket Pool" },
    { symbol: "RSR", name: "Reserve Rights" },
    { symbol: "SAND", name: "The Sandbox" },
    { symbol: "SKL", name: "SKALE" },
    { symbol: "SNT", name: "Status" },
    { symbol: "SNX", name: "Synthetix Network Token" },
    { symbol: "STG", name: "Stargate Finance" },
    { symbol: "STORJ", name: "Storj" },
    { symbol: "STRK", name: "Starknet" },
    { symbol: "SUPER", name: "SuperVerse" },
    { symbol: "SUSHI", name: "Sushi" },
    { symbol: "SYN", name: "Synapse" },
    { symbol: "TLM", name: "Alien Worlds" },
    { symbol: "TRU", name: "TrueFi" },
    { symbol: "TURBO", name: "Turbo" },
    { symbol: "UMA", name: "UMA" },
    { symbol: "UNI", name: "Uniswap" },
    { symbol: "USUAL", name: "Usual" },
    { symbol: "VANRY", name: "Vanar Chain" },
    { symbol: "WOO", name: "WOO" },
    { symbol: "YFI", name: "yearn.finance" },
    { symbol: "YGG", name: "Yield Guild Games" },
    { symbol: "ZRO", name: "LayerZero" },
    { symbol: "ZRX", name: "0x" },
  ];

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const connectWallet = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      alert("Please install MetaMask first!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setUserAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const sendPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      if (selectedCrypto === "eth") {
        const tx = await signer.sendTransaction({
          to: ERC20_WALLET,
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        alert("Thank you for your donation! 🎉");
      } else if (selectedCrypto === "usdt") {
        const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const USDT_ABI = [
          "function transfer(address to, uint amount) returns (bool)",
        ];
        const contract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, signer);
        const tx = await contract.transfer(
          ERC20_WALLET,
          ethers.parseUnits(amount, 6),
        );
        await tx.wait();
        alert("Thank you for your donation! 🎉");
      }

      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 text-[black] dark:text-[#ffff] lg:px-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#01C5BA]" />
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">
            Support Our Mission
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Help us keep education free for everyone
          </p>
        </div>

        <div className="md:p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold">
                Why Your Support Matters
              </h2>
              <div className="space-y-4 text-left text-gray-600 dark:text-gray-400">
                <p>
                  I&apos;m building this educational platform completely on my
                  own, without any team or funding. Every course you see here is
                  carefully curated and made available for free because I
                  believe education should be accessible to everyone.
                </p>
                <p>
                  However, running this platform comes with significant costs:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Server hosting and bandwidth for video streaming</li>
                  <li>Database storage for thousands of courses</li>
                  <li>Content delivery networks for global access</li>
                </ul>
                <p>
                  Your donation, no matter how small, helps me keep this
                  platform running and continue adding new courses. Every
                  contribution goes directly toward hosting costs and platform
                  improvements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* UPI Payment */}
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <div className="mb-4 text-center">
              <span className="text-lg font-medium">UPI Payment</span>
            </div>
            <div className="text-center">
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#01C5BA] px-6 py-3 font-semibold text-white hover:bg-[#00A896]"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Pay with UPI
              </a>
            </div>
          </div>

          {/* Trocador - Swap Any Crypto Widget */}
          <div className="rounded-lg border-2 border-indigo-500 bg-gray-50 p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center">
              <RefreshCw className="mr-2 h-6 w-6 text-indigo-500" />
              <span className="text-xl font-bold">
                Swap Any Crypto to Donate
              </span>
            </div>

            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Convert any cryptocurrency to donate directly</p>
            </div>

            {/* Embedded Trocador Widget */}
            <iframe
              src="https://trocador.app/anonpay/?ticker_to=eth&network_to=ERC20&address=0x07F2e0Bdb731Ddf816Df2295d6B1DeF64cB8A0Ac&donation=True&simple_mode=True&name=EducationalHub&description=Donation&bgcolor=True"
              width="100%"
              height="600"
              style={{ border: 0 }}
              className="rounded-lg"
              title="Trocador Crypto Swap"
            />

            <div className="mt-4 rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <div className="flex items-start">
                <Info className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-700 dark:text-indigo-300" />
                <div className="text-xs text-indigo-700 dark:text-indigo-300">
                  <strong>Privacy-focused:</strong> No account needed • No KYC •
                  Supports 100+ cryptocurrencies
                </div>
              </div>
            </div>
          </div>

          {/* Trocador - Swap Any Crypto */}
          <div className="rounded-lg border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:from-gray-800 dark:to-gray-900">
            <div className="mb-4 flex items-center justify-center">
              <RefreshCw className="mr-2 h-6 w-6 text-indigo-500" />
              <span className="text-xl font-bold">
                Swap Any Crypto to Donate
              </span>
            </div>

            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                Don&apos;t have ETH, BTC, or USDT? No problem!
              </p>
              <p>
                Swap from <strong>any cryptocurrency</strong> to donate directly
              </p>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <a
                href={trocadorETH}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border-2 border-purple-500 bg-white p-4 font-semibold transition-all hover:bg-purple-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span className="mr-2">→</span> Donate ETH
              </a>
              <a
                href={trocadorBTC}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border-2 border-orange-500 bg-white p-4 font-semibold transition-all hover:bg-orange-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span className="mr-2">→</span> Donate BTC
              </a>
              <a
                href={trocadorUSDT}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border-2 border-green-500 bg-white p-4 font-semibold transition-all hover:bg-green-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <span className="mr-2">→</span> Donate USDT
              </a>
            </div>

            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <div className="flex items-start">
                <Info className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-700 dark:text-indigo-300" />
                <div className="text-xs text-indigo-700 dark:text-indigo-300">
                  <strong>Privacy-focused:</strong> No account needed • No KYC •
                  Supports 100+ cryptocurrencies including XMR, LTC, DOGE, and
                  more
                </div>
              </div>
            </div>
          </div>

          {/* Web3 Crypto Payment */}
          <div className="rounded-lg border-2 border-[#01C5BA] bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-800 dark:to-gray-900">
            <div className="mb-4 flex items-center justify-center">
              <Wallet className="mr-2 h-6 w-6 text-[#01C5BA]" />
              <span className="text-xl font-bold">Pay with Crypto Wallet</span>
            </div>

            {!walletConnected ? (
              <div className="text-center">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Connect MetaMask to donate ETH or USDT instantly
                </p>
                <button
                  onClick={connectWallet}
                  className="inline-flex items-center rounded-lg bg-[#01C5BA] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#00A896]"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect MetaMask
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded bg-green-50 p-3 dark:bg-green-900/20">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Connected: {userAddress.slice(0, 6)}...
                    {userAddress.slice(-4)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedCrypto("eth")}
                    className={`rounded-lg border-2 p-3 font-semibold transition-all ${
                      selectedCrypto === "eth"
                        ? "border-[#01C5BA] bg-[#01C5BA] text-white"
                        : "border-gray-300 hover:border-[#01C5BA] dark:border-gray-600"
                    }`}
                  >
                    ETH
                  </button>
                  <button
                    onClick={() => setSelectedCrypto("usdt")}
                    className={`rounded-lg border-2 p-3 font-semibold transition-all ${
                      selectedCrypto === "usdt"
                        ? "border-[#01C5BA] bg-[#01C5BA] text-white"
                        : "border-gray-300 hover:border-[#01C5BA] dark:border-gray-600"
                    }`}
                  >
                    USDT
                  </button>
                </div>

                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (e.g., 0.01)"
                  className="w-full rounded-lg border-2 border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700"
                />

                <button
                  onClick={sendPayment}
                  disabled={processing}
                  className="w-full rounded-lg bg-[#01C5BA] py-3 font-semibold text-white transition-colors hover:bg-[#00A896] disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : `Donate ${selectedCrypto.toUpperCase()}`}
                </button>
              </div>
            )}
          </div>

          {/* Bitcoin Address */}
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center">
              <Bitcoin className="mr-2 h-6 w-6 text-orange-500" />
              <span className="text-lg font-medium">Bitcoin (BTC)</span>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                BTC Address:
              </label>
              <div className="flex items-center space-x-2">
                <code className="relative flex-1 rounded bg-gray-100 p-3 font-mono text-sm dark:bg-gray-700">
                  {BTC_ADDRESS}
                  <button
                    onClick={() => copyToClipboard(BTC_ADDRESS, "btc")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded bg-[#01C5BA] p-3 text-white hover:bg-[#00A896]"
                  >
                    {copiedField === "btc" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </code>
              </div>
              {copiedField === "btc" && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Copied!
                </p>
              )}
            </div>
          </div>

          {/* ERC20 Multi-Coin Wallet */}
          <div className="rounded-lg border-2 border-purple-500 bg-gray-50 p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center">
              <Wallet className="mr-2 h-6 w-6 text-purple-500" />
              <span className="text-lg font-medium">
                Multi-Crypto Wallet (ERC20)
              </span>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Wallet Address (Supports 100+ ERC20 Tokens):
              </label>
              <div className="flex items-center space-x-2">
                <code className="relative flex-1 rounded bg-gray-100 p-3 font-mono text-sm dark:bg-gray-700">
                  {ERC20_WALLET}
                  <button
                    onClick={() => copyToClipboard(ERC20_WALLET, "erc20")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded bg-[#01C5BA] p-3 text-white hover:bg-[#00A896]"
                  >
                    {copiedField === "erc20" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </code>
              </div>
              {copiedField === "erc20" && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Copied!
                </p>
              )}
            </div>

            {/* Supported Networks */}
            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-800 dark:text-blue-200">
                <Info className="mr-2 h-4 w-4" />
                Supported Networks:
              </h4>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Ethereum (ERC20)</li>
                <li>• BNB Smart Chain (BEP20)</li>
                <li>• Arbitrum One</li>
                <li>• Optimism</li>
              </ul>
            </div>

            {/* Popular Coins */}
            <div className="mb-4">
              <h4 className="mb-3 text-sm font-semibold">Popular Coins:</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {popularCryptos.map((coin) => (
                  <div
                    key={coin.symbol}
                    className="rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <div className="text-sm font-semibold">{coin.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {coin.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Supported Coins - Collapsible */}
            <div>
              <button
                onClick={() => setShowAllCoins(!showAllCoins)}
                className="mb-3 flex w-full items-center justify-between rounded-lg bg-purple-100 p-3 text-sm font-semibold text-purple-800 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
              >
                <span>
                  All Supported ERC20 Tokens ({allSupportedCoins.length})
                </span>
                {showAllCoins ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAllCoins && (
                <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {allSupportedCoins.map((coin) => (
                      <div
                        key={coin.symbol}
                        className="rounded border border-gray-200 p-2 dark:border-gray-600"
                      >
                        <div className="text-sm font-semibold">
                          {coin.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {coin.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Important:</strong> Only send tokens using the
                networks listed above. Minimum transfer: 5 USDT. Transfers via
                other networks will result in loss of funds.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
              Your Support Helps:
            </h3>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Keep all courses free</li>
              <li>• Add new content regularly</li>
              <li>• Improve platform features</li>
              <li>• Maintain 99.9% uptime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
