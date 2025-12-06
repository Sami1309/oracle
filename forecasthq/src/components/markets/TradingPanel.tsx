'use client';

import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

interface TradingPanelProps {
  market: {
    id: string;
    title: string;
    currentProbability: number;
    yesShares: number;
    noShares: number;
  };
  userBalance: number;
  onTrade: (position: boolean, amount: number, shares: number) => void;
}

export function TradingPanel({ market, userBalance, onTrade }: TradingPanelProps) {
  const [amount, setAmount] = useState(10);
  const [inputValue, setInputValue] = useState('10');
  const [position, setPosition] = useState<'yes' | 'no'>('yes');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevWinningsRef = useRef(0);

  // Use the market's current probability directly (in cents)
  const yesPrice = market.currentProbability * 100;
  const noPrice = (1 - market.currentProbability) * 100;

  // Calculate winnings: bet / probability
  // If you bet $10 on Yes at 50%, you win $10/0.50 = $20 total, so profit is $10
  const selectedPrice = position === 'yes' ? yesPrice : noPrice;
  const potentialPayout = amount / (selectedPrice / 100); // Total return if you win
  const potentialWin = potentialPayout - amount; // Profit

  // Trigger animation when winnings change
  useEffect(() => {
    if (Math.abs(potentialWin - prevWinningsRef.current) > 0.01) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevWinningsRef.current = potentialWin;
      return () => clearTimeout(timer);
    }
  }, [potentialWin]);

  const handleAmountChange = (value: number) => {
    const newAmount = Math.min(Math.max(0, value), userBalance);
    setAmount(newAmount);
    setInputValue(newAmount.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(Math.min(numValue, userBalance));
    } else if (value === '') {
      setAmount(0);
    }
  };

  const handleInputBlur = () => {
    // Clean up the input on blur
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      setInputValue('0');
      setAmount(0);
    } else {
      const cleaned = Math.min(Math.max(0, parseFloat(inputValue)), userBalance);
      setAmount(cleaned);
      setInputValue(cleaned.toString());
    }
  };

  const quickAmounts = [
    { label: '+$1', value: 1 },
    { label: '+$20', value: 20 },
    { label: '+$100', value: 100 },
    { label: 'Max', value: userBalance },
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-5 space-y-5">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-xl">DU</span>
        </div>
        <span className="text-white font-medium">Demo User</span>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('buy')}
            className={`text-lg font-medium pb-1 border-b-2 transition-colors ${
              mode === 'buy'
                ? 'text-white border-white'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`text-lg font-medium pb-1 border-b-2 transition-colors ${
              mode === 'sell'
                ? 'text-white border-white'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Sell
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>Market</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Yes/No Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPosition('yes')}
          className={`py-4 rounded-lg font-medium text-lg transition-all flex items-center justify-center gap-2 ${
            position === 'yes'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Yes <span className="text-white/80">{yesPrice.toFixed(1)}¢</span>
        </button>
        <button
          onClick={() => setPosition('no')}
          className={`py-4 rounded-lg font-medium text-lg transition-all flex items-center justify-center gap-2 ${
            position === 'no'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          No <span className="text-white/80">{noPrice.toFixed(1)}¢</span>
        </button>
      </div>

      {/* Amount Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Amount</span>
          <div className="flex items-center">
            <span className="text-4xl font-bold text-white">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="text-4xl font-bold text-white bg-transparent border-none outline-none w-24"
              placeholder="0"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleAmountChange(qa.value === userBalance ? userBalance : amount + qa.value)}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Amount Slider */}
        <input
          type="range"
          min={1}
          max={userBalance}
          value={amount}
          onChange={(e) => handleAmountChange(Number(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>$1</span>
          <span>Balance: ${userBalance.toFixed(0)}</span>
        </div>
      </div>

      {/* Potential Winnings */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">To win</span>
          <span className="text-lg">💵</span>
          <div className="flex-1" />
          <span
            className={`text-3xl font-bold text-green-500 transition-all duration-300 ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}
          >
            ${potentialPayout > 0 ? potentialPayout.toFixed(2) : '0'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <span>Avg. Price {selectedPrice.toFixed(0)}¢</span>
          <Info className="w-3 h-3" />
        </div>
      </div>

      {/* Trade Button */}
      <button
        onClick={() => onTrade(position === 'yes', amount, potentialPayout)}
        disabled={amount <= 0 || amount > userBalance}
        className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
      >
        Trade
      </button>
    </div>
  );
}
