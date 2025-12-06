// Logarithmic Market Scoring Rule - industry standard for prediction markets

export class LMSR {
  private b: number; // liquidity parameter

  constructor(liquidity: number = 1000) {
    // Higher liquidity = smaller price impact per trade
    this.b = liquidity;
  }

  // Calculate cost to buy shares
  cost(currentYes: number, currentNo: number, buyYes: number, buyNo: number): number {
    const before = this.b * Math.log(
      Math.exp(currentYes / this.b) + Math.exp(currentNo / this.b)
    );
    const after = this.b * Math.log(
      Math.exp((currentYes + buyYes) / this.b) +
      Math.exp((currentNo + buyNo) / this.b)
    );
    return after - before;
  }

  // Get current probability
  probability(currentYes: number, currentNo: number): number {
    const expYes = Math.exp(currentYes / this.b);
    const expNo = Math.exp(currentNo / this.b);
    return expYes / (expYes + expNo);
  }

  // Get price for buying yes/no shares (in cents, 0-100)
  price(currentYes: number, currentNo: number, buyingYes: boolean): number {
    const prob = this.probability(currentYes, currentNo);
    return buyingYes ? prob * 100 : (1 - prob) * 100;
  }

  // Calculate shares received for a given cost
  sharesToBuy(
    currentYes: number,
    currentNo: number,
    amount: number,
    buyingYes: boolean
  ): number {
    // Binary search for shares
    let low = 0;
    let high = amount * 10;

    while (high - low > 0.001) {
      const mid = (low + high) / 2;
      const cost = buyingYes
        ? this.cost(currentYes, currentNo, mid, 0)
        : this.cost(currentYes, currentNo, 0, mid);

      if (cost < amount) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return low;
  }

  // Calculate potential winnings if outcome is correct
  potentialWinnings(shares: number, avgPrice: number): number {
    // Each share pays out $1 if correct
    return shares - (shares * avgPrice);
  }
}
