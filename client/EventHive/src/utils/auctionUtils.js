/**
 * Calculates the minimum bid amount required for the next bid.
 * @param {Object} auction - The auction data object containing startingBid, currentHighestBid, and bidIncrement.
 * @param {Object} leaderboard - The leaderboard data object containing minimumNextBid.
 * @returns {number} The minimum bid amount.
 */
export const getMinimumBidAmount = (auction, leaderboard) => {
  if (!auction) return 0;
  return leaderboard.minimumNextBid ||
         (auction.bids?.length === 0 ? auction.startingBid : auction.currentHighestBid + auction.bidIncrement);
};

/**
 * Generates helper text for the bid input field based on the number of bids.
 * @param {Object} auction - The auction data object.
 * @param {Object} leaderboard - The leaderboard data object.
 * @returns {string} The helper text for the bid input field.
 */
export const getHelperText = (auction, leaderboard) => {
  const minBid = getMinimumBidAmount(auction, leaderboard);
  if (leaderboard.totalBids === 0) {
    return `Starting bid: $${minBid.toLocaleString()}`;
  }
  return `Minimum bid: $${minBid.toLocaleString()}`;
};

/**
 * Validates if a bid amount is valid based on auction and leaderboard data.
 * @param {number} amount - The bid amount to validate.
 * @param {Object} auction - The auction data object.
 * @param {Object} leaderboard - The leaderboard data object.
 * @param {boolean} isEnded - Whether the auction has ended.
 * @returns {boolean} True if the bid is valid, false otherwise.
 */
export const isBidValid = (amount, auction, leaderboard, isEnded) => {
  if (!auction || isEnded) return false;
  const bidAmountNum = Number(amount);
  const minimumBid = getMinimumBidAmount(auction, leaderboard);

  return !isNaN(bidAmountNum) && bidAmountNum >= minimumBid;
};
