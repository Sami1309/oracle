'use client';

import { useState } from 'react';
import { LMSR } from '@/lib/lmsr';

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
  const [position, setPosition] = useState<'yes' | 'no'>('yes');

  const lmsr = new LMSR(100);

  const shares = lmsr.sharesToBuy(
    market.yesShares,
    market.noShares,
    amount,
    position === 'yes'
  );

  const newProb = position === 'yes'
    ? lmsr.probability(market.yesShares + shares, market.noShares)
    : lmsr.probability(market.yesShares, market.noShares + shares);

  const potentialPayout = shares;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="font-semibold text-lg">Place Prediction</h3>

      {/* Position Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPosition('yes')}
          className={`py-3 rounded-lg font-medium transition-all ${
            position === 'yes'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Yes ({(market.currentProbability * 100).toFixed(0)}%)
        </button>
        <button
          onClick={() => setPosition('no')}
          className={`py-3 rounded-lg font-medium transition-all ${
            position === 'no'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          No ({((1 - market.currentProbability) * 100).toFixed(0)}%)
        </button>
      </div>

      {/* Amount Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount</span>
          <span className="font-medium">${amount}</span>
        </div>
        <input
          type="range"
          min={1}
          max={Math.min(100, userBalance)}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$1</span>
          <span>Balance: ${userBalance.toFixed(0)}</span>
        </div>
      </div>

      {/* Trade Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Shares received</span>
          <span className="font-medium">{shares.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Avg price per share</span>
          <span className="font-medium">${(amount / shares).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Potential payout</span>
          <span className="font-medium text-green-600">${potentialPayout.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">New market probability</span>
          <span className="font-medium">{(newProb * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onTrade(position === 'yes', amount, shares)}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/25"
      >
        Predict {position.toUpperCase()} for ${amount}
      </button>
    </div>
  );
}
