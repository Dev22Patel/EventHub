const calculateLeaderboard = (auction) => {
    if (!auction.bids || auction.bids.length === 0) {
        return {
            topBids: [],
            totalBids: 0,
            uniqueBidders: 0,
            currentLeader: null
        };
    }

    const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
    const topBids = sortedBids.slice(0, 5).map((bid, index) => ({
        rank: index + 1,
        amount: bid.amount,
        bidderId: bid.bidder,
        timestamp: bid.createdAt,
        isWinning: index === 0
    }));
    const uniqueBidders = new Set(auction.bids.map(bid => bid.bidder.toString())).size;

    return {
        topBids,
        totalBids: auction.bids.length,
        uniqueBidders,
        currentLeader: sortedBids[0] || null,
        currentHighestBid: auction.currentHighestBid,
        minimumNextBid: auction.currentHighestBid + auction.bidIncrement
    };
};

const emitLeaderboardUpdate = (io, auctionId, auction, updateType = 'bid_update') => {
    if (!io) return;

    const leaderboardData = calculateLeaderboard(auction);
    const now = new Date();
    const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

    const updateData = {
        auctionId,
        leaderboard: leaderboardData,
        serverTime: now,
        auctionEndTime,
        status: auction.status,
        updateType,
        timestamp: now
    };

    io.to(`auction_${auctionId}`).emit('leaderboard_update', updateData);
    io.to(`event_${auction.event}`).emit('auction_leaderboard_update', {
        auctionId,
        itemName: auction.itemName,
        ...updateData
    });

    console.log(`Leaderboard update emitted for auction ${auctionId}, type: ${updateType}`);
};

module.exports = { calculateLeaderboard, emitLeaderboardUpdate };
