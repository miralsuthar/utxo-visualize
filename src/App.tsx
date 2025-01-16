import { useState } from "react";
import { motion } from "framer-motion";

const ADDRESSES = {
  A: "Address 1 (Alice)",
  B: "Address 2 (Bob)",
} as const;

interface UTXO {
  id: number;
  value: number;
  address: keyof typeof ADDRESSES;
}

interface Transaction {
  id: number;
  from: keyof typeof ADDRESSES;
  to: keyof typeof ADDRESSES;
  inputs: UTXO[];
  outputs: UTXO[];
}

interface TransactionFlowProps {
  inputs: UTXO[];
  amount: number;
  change: number;
  onComplete: () => void;
}

const UTXOVisualization = () => {
  const [addresses] = useState({
    A: "Address 1 (Alice)",
    B: "Address 2 (Bob)",
  });

  const [utxos, setUtxos] = useState<Record<keyof typeof ADDRESSES, UTXO[]>>({
    A: [
      { id: 1, value: 10, address: "A" },
      { id: 2, value: 5, address: "A" },
      { id: 3, value: 3, address: "A" },
    ],
    B: [
      { id: 4, value: 8, address: "B" },
      { id: 5, value: 4, address: "B" },
    ],
  });

  const [selectedUTXOs, setSelectedUTXOs] = useState<UTXO[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sendingAddress, setSendingAddress] = useState<
    keyof typeof ADDRESSES | null
  >(null);
  const [receivingAddress, setReceivingAddress] = useState<
    keyof typeof ADDRESSES | null
  >(null);
  const [amount, setAmount] = useState<string>("");
  // const [error, setError] = useState("");

  const totalSelected = selectedUTXOs.reduce(
    (sum, utxo) => sum + utxo.value,
    0,
  );

  const handleUTXOSelect = (utxo: UTXO) => {
    // setError(""); // Clear any existing errors
    if (!sendingAddress) {
      setSendingAddress(utxo.address);
      setSelectedUTXOs([utxo]);
    } else if (sendingAddress === utxo.address) {
      if (selectedUTXOs.find((u) => u.id === utxo.id)) {
        setSelectedUTXOs(selectedUTXOs.filter((u) => u.id !== utxo.id));
        if (selectedUTXOs.length === 1) {
          setSendingAddress(null);
          setAmount("");
        }
      } else {
        setSelectedUTXOs([...selectedUTXOs, utxo]);
      }
    }
  };

  const handleAddressSelect = (address: keyof typeof ADDRESSES) => {
    if (address !== sendingAddress) {
      setReceivingAddress(address);
      // setError("");
    }
  };

  const validateTransaction = (sendAmount: number) => {
    if (!sendAmount || isNaN(sendAmount)) {
      // setError("Please enter a valid amount");
      return false;
    }

    if (sendAmount <= 0) {
      // setError("Amount must be greater than 0");
      return false;
    }

    if (sendAmount >= totalSelected) {
      // setError("Insufficient funds for transaction fee");
      return false;
    }

    const minimumChange = 0.001; // Minimum required change for transaction fee
    if (totalSelected - sendAmount < minimumChange) {
      // setError(`Minimum ${minimumChange} BTC required for transaction fee`);
      return false;
    }

    return true;
  };

  const TransactionFlow = ({
    inputs,
    amount,
    change,
    onComplete,
  }: TransactionFlowProps) => {
    // Function to handle outside clicks
    const handleBackdropClick = (e: any) => {
      if (e.target === e.currentTarget) {
        onComplete();
      }
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white p-8 rounded-lg w-full max-w-2xl cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center text-sm text-gray-500 mb-4">
            Click outside to continue
          </div>
          <svg viewBox="0 0 800 400" className="w-full">
            {/* Input UTXOs */}
            {inputs.map((input, index) => (
              <g key={input.id}>
                <motion.circle
                  cx={100}
                  cy={100 + index * 60}
                  r={20}
                  fill="#3B82F6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                />
                <motion.text
                  x={100}
                  y={100 + index * 60}
                  textAnchor="middle"
                  dy=".3em"
                  fill="white"
                  fontSize="12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {input.value}
                </motion.text>

                {/* Path to center */}
                <motion.path
                  d={`M ${120} ${100 + index * 60} C ${250} ${100 + index * 60}, ${300} ${200}, ${400} ${200}`}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                />
              </g>
            ))}

            {/* Center combining node */}
            <motion.circle
              cx={400}
              cy={200}
              r={30}
              fill="#10B981"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: inputs.length * 0.2 + 0.8 }}
            />
            <motion.text
              x={400}
              y={200}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: inputs.length * 0.2 + 0.8 }}
            >
              {inputs.reduce((sum, i) => sum + i.value, 0)}
            </motion.text>

            {/* Output paths */}
            <motion.path
              d={`M ${420} ${200} C ${550} ${200}, ${600} ${150}, ${700} ${150}`}
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.3, duration: 0.5 }}
            />
            <motion.path
              d={`M ${420} ${200} C ${550} ${200}, ${600} ${250}, ${700} ${250}`}
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.3, duration: 0.5 }}
            />

            {/* Output UTXOs */}
            <motion.circle
              cx={700}
              cy={150}
              r={20}
              fill="#10B981"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.8 }}
            />
            <motion.text
              x={700}
              y={150}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.8 }}
            >
              {amount}
            </motion.text>

            <motion.circle
              cx={700}
              cy={250}
              r={20}
              fill="#10B981"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.8 }}
            />
            <motion.text
              x={700}
              y={250}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.8 }}
            >
              {change}
            </motion.text>

            {/* Labels */}
            <motion.text
              x={100}
              y={50}
              textAnchor="middle"
              fill="#1F2937"
              fontSize="14"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Input UTXOs
            </motion.text>

            <motion.text
              x={700}
              y={100}
              textAnchor="middle"
              fill="#1F2937"
              fontSize="14"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: inputs.length * 0.2 + 1.8 }}
            >
              Output UTXOs
            </motion.text>
          </svg>
        </div>
      </motion.div>
    );
  };

  const [isTransacting, setIsTransacting] = useState(false);

  const createTransaction = () => {
    if (selectedUTXOs.length === 0 || !sendingAddress || !receivingAddress)
      return;

    const sendAmount = parseFloat(amount);
    if (!validateTransaction(sendAmount)) return;

    const changeAmount = totalSelected - sendAmount;

    // Remove spent UTXOs from sending address
    const remainingUTXOs = {
      ...utxos,
      [sendingAddress]: utxos[sendingAddress].filter(
        (utxo) => !selectedUTXOs.find((u) => u.id === utxo.id),
      ),
    };

    // Create new UTXOs
    const newId =
      Math.max(
        ...Object.values(utxos)
          .flat()
          .map((u) => u.id),
      ) + 1;
    const recipientUTXO = {
      id: newId,
      value: sendAmount,
      address: receivingAddress,
    };
    const changeUTXO = {
      id: newId + 1,
      value: changeAmount,
      address: sendingAddress,
    };

    // Add new UTXOs to their respective addresses
    setUtxos({
      ...remainingUTXOs,
      [receivingAddress]: [...remainingUTXOs[receivingAddress], recipientUTXO],
      [sendingAddress]: [...remainingUTXOs[sendingAddress], changeUTXO],
    });

    // Record the transaction
    setTransactions([
      ...transactions,
      {
        id: transactions.length + 1,
        from: sendingAddress,
        to: receivingAddress,
        inputs: selectedUTXOs,
        outputs: [recipientUTXO, changeUTXO],
      },
    ]);

    // Show transaction animation
    setIsTransacting(true);

    // Wait for animation to complete before updating state
    setTimeout(() => {
      setIsTransacting(false);
      // Reset selection state
      setSelectedUTXOs([]);
      setSendingAddress(null);
      setReceivingAddress(null);
      setAmount("");
      // setError("");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">
        UTXO Model Visualization
      </h1>

      {/* {error && ( */}
      {/*   <Alert variant="destructive" className="mb-4"> */}
      {/*     <AlertCircle className="h-4 w-4" /> */}
      {/*     <AlertDescription>{error}</AlertDescription> */}
      {/*   </Alert> */}
      {/* )} */}

      <div className="grid grid-cols-2 gap-8 mb-8">
        {Object.entries(addresses).map(([key, name]) => (
          <div
            key={key}
            className={`
              p-6 rounded-lg
              ${
                sendingAddress === key
                  ? "bg-blue-100"
                  : receivingAddress === key
                    ? "bg-green-100"
                    : "bg-white"
              }
            `}
          >
            <h2 className="text-xl font-semibold mb-4">
              {name}
              <span className="text-sm font-normal ml-2">
                (Total:{" "}
                {utxos[key as keyof typeof ADDRESSES].reduce(
                  (sum: number, utxo: UTXO) => sum + utxo.value,
                  0,
                )}{" "}
                BTC)
              </span>
            </h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {utxos[key as keyof typeof ADDRESSES].map((utxo: UTXO) => (
                <motion.div
                  key={utxo.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-lg shadow-md cursor-pointer
                    ${
                      selectedUTXOs.find((u) => u.id === utxo.id)
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-50"
                    }
                    ${sendingAddress && sendingAddress !== key ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={() => handleUTXOSelect(utxo)}
                >
                  <div className="font-medium">UTXO #{utxo.id}</div>
                  <div className="text-sm">{utxo.value} BTC</div>
                </motion.div>
              ))}
            </div>
            {sendingAddress && sendingAddress !== key && !receivingAddress && (
              <button
                onClick={() =>
                  handleAddressSelect(key as keyof typeof ADDRESSES)
                }
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Select as Recipient
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1 max-w-xs">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              // setError("");
            }}
            placeholder="Enter amount to send"
            className="w-full px-4 py-2 border rounded-lg"
            disabled={!selectedUTXOs.length || !receivingAddress}
          />
        </div>
        <div className="text-sm text-gray-600">
          Selected: {totalSelected} BTC
          {amount && !isNaN(Number(amount)) && (
            <span className="ml-2">
              | Change: {(totalSelected - parseFloat(amount)).toFixed(3)} BTC
            </span>
          )}
        </div>
        <button
          onClick={createTransaction}
          disabled={!selectedUTXOs.length || !receivingAddress || !amount}
          className={`
            px-6 py-3 rounded-lg font-medium
            ${
              !selectedUTXOs.length || !receivingAddress || !amount
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }
          `}
        >
          Create Transaction
        </button>
      </div>

      {isTransacting && (
        <TransactionFlow
          inputs={selectedUTXOs}
          amount={parseFloat(amount)}
          change={totalSelected - parseFloat(amount)}
          onComplete={() => setIsTransacting(false)}
        />
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="font-medium mb-2">
                Transaction #{tx.id}: {addresses[tx.from]} → {addresses[tx.to]}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Inputs:
                  </div>
                  {tx.inputs.map((input) => (
                    <div key={input.id} className="text-sm">
                      UTXO #{input.id} ({input.value} BTC)
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Outputs:
                  </div>
                  {tx.outputs.map((output) => (
                    <div key={output.id} className="text-sm">
                      UTXO #{output.id} ({output.value} BTC) →{" "}
                      {addresses[output.address]}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How it works:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Select one or more UTXOs from a sending address</li>
          <li>Choose a receiving address for the transaction</li>
          <li>
            Enter the amount you want to send (must be less than total selected)
          </li>
          <li>The remaining amount will be returned as change</li>
          <li>A small amount is required for transaction fees</li>
        </ol>
      </div>
    </div>
  );
};

export default UTXOVisualization;
