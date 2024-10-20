const Event = require('../models/eventModel');
const mongoose = require('mongoose');
const Auction = require('../models/auctionModel');
const User = require('../models/user-model');
const sendMail = require('./emailController'); // Import the sendMail function
// Create a new Auction
exports.createAuction = async (req, res) => {
    try {
        const auctionData = req.body;

        // Validate event ID
        if (!mongoose.Types.ObjectId.isValid(auctionData.event)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        const auction = new Auction(auctionData);
        await auction.save();

        res.status(201).json(auction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Read all Auctions
exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate('event');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read a single Auction by ID
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('event');
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an Auction
exports.updateAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an Auction
exports.deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndDelete(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAuctionForEvent = async (req, res) => {
    try {
        const { eventId, auctionId } = req.params;

        // Validate eventId and auctionId
        if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ error: "Invalid event ID or auction ID" });
        }

        // Find the auction
        const auction = await Auction.findOne({ _id: auctionId, event: eventId }).populate('event');

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found for this event' });
        }

        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        // Check if the auction should be marked as finished
        if (now > auctionEndTime && auction.status === 'active') {
            auction.status = 'finished';
            await auction.save();
            // Send email notification to the host
            const host = await User.findById(auction.event.host);
                if (!host || !host.email) {
                    console.error('Host or host email not found');
                    throw new Error('Host email not found');
                }

                // Send emails when auction ends
                if (auction.bids.length > 0) {
                    // Find the winning bid
                    const winningBid = auction.bids.reduce((prev, current) =>
                        (prev.amount > current.amount) ? prev : current
                    );

                    // Send email to winner
                    const winner = await User.findById(winningBid.bidder);
                    if (winner && winner.email) {
                        const winnerEmailMessage = `
                            <h2>Congratulations! You've Won the Auction!</h2>
                            <p>You are the winning bidder for "${auction.itemName}"</p>
                            <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
                            <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
                            <p>The event host will contact you soon with further details.</p>
                        `;
                        try {
                            await sendMail(
                                winner.email,
                                `Auction Won - ${auction.itemName}`,
                                winnerEmailMessage
                            );
                            console.log(`Email sent to winner: ${winner.email}`);
                        } catch (emailError) {
                            console.error('Error sending email to winner:', emailError);
                        }
                    } else {
                        console.error('Winner email not found');
                    }

                    // Send email to event host about auction end
                    const hostEmailMessage = `
                        <h2>Your Auction Has Ended!</h2>
                        <p>The auction for "${auction.itemName}" has ended.</p>
                        <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
                        <p>Winner Email: ${winner.email}</p>
                        <p>Please contact the winner to arrange delivery/payment.</p>
                    `;
                    try {
                        await sendMail(
                            host.email,
                            `Auction Ended - ${auction.itemName}`,
                            hostEmailMessage
                        );
                        console.log(`Email sent to host: ${host.email}`);
                    } catch (emailError) {
                        console.error('Error sending email to host:', emailError);
                    }
                } else {
                    // Send email to host if no bids were placed
                    const noBidsMessage = `
                        <h2>Your Auction Has Ended</h2>
                        <p>The auction for "${auction.itemName}" has ended.</p>
                        <p>Unfortunately, no bids were placed on this item.</p>
                        <p>End Time: ${auctionEndTime.toLocaleString()}</p>
                    `;
                    try {
                        await sendMail(
                            host.email,
                            `Auction Ended - ${auction.itemName}`,
                            noBidsMessage
                        );
                        console.log(`Email sent to host: ${host.email}`);
                    } catch (emailError) {
                        console.error('Error sending email to host:', emailError);
                    }
                }
        }

        // Return auction data along with server time and end time
        res.status(200).json({
            ...auction.toObject(),
            serverTime: now,
            auctionEndTime: auctionEndTime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Place a bid for an auction
exports.placeBid = async (req, res) => {
    const { auctionId } = req.params;
    const { amount, id,userId } = req.body;
    const io = req.app.get('socketio');

    try {
        const auction = await Auction.findById(auctionId)
            .populate('event')
            .populate('event.host', 'email')  // Populate host's email
            .populate('bids.bidder', 'email'); // Populate bidder's email

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check if the auction is still active
        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        // First check the current status
        if (auction.status !== 'active') {
            return res.status(400).json({
                message: 'Auction is not active',
                serverTime: now,
                auctionEndTime: auctionEndTime
            });
        }

        // Then check if time has expired
        if (now > auctionEndTime) {
            try {
                auction.status = 'finished';
                await auction.save();
                return res.status(400).json({
                    message: 'Auction has ended',
                    serverTime: now,
                    auctionEndTime: auctionEndTime
                });
            } catch (saveError) {
                console.error('Error updating auction status:', saveError);
                return res.status(500).json({
                    message: 'Error updating auction status',
                    error: saveError.message
                });
            }
        }

        // Check if the bidder is the event host
        if (auction.event.host.toString() === id) {
            return res.status(403).json({ message: 'Event hosts cannot bid on their own auctions' });
        }

        // Validate bid amount
        if (
            amount <= auction.currentHighestBid ||
            amount < auction.startingBid ||
            amount < auction.currentHighestBid + auction.bidIncrement
        ) {
            return res.status(400).json({
                message: 'Invalid bid amount',
                currentHighestBid: auction.currentHighestBid,
                minimumBid: Math.max(auction.startingBid, auction.currentHighestBid + auction.bidIncrement)
            });
        }

        // Create new bid object
        const newBid = {
            bidder: id,
            amount,
            createdAt: now,
        };

        // Update auction with new bid
        auction.bids.push(newBid);
        auction.currentHighestBid = amount;

        // Save the updated auction
        try {
            await auction.save();
            const user = await User.findById(userId);
            if (!user.participatedAuctions.includes(auctionId)) {
            user.participatedAuctions.push(auctionId);
            await user.save();
            }
            const hostEmailMessage = `
            <h2>New Bid Placed!</h2>
            <p>A new bid has been placed on your auction item "${auction.itemName}"</p>
            <p>Bid Amount: $${amount.toLocaleString()}</p>
            <p>Time: ${now.toLocaleString()}</p>
            <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
        `;
        const host = await User.findById(auction.event.host);
            if (!host || !host.email) {
                console.error('Host or host email not found');
            } else {
                const hostEmailMessage = `
                    <h2>New Bid Placed!</h2>
                    <p>A new bid has been placed on your auction item "${auction.itemName}"</p>
                    <p>Bid Amount: $${amount.toLocaleString()}</p>
                    <p>Time: ${now.toLocaleString()}</p>
                    <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
                `;
                try {
                    await sendMail(
                        host.email,
                        `New Bid on ${auction.itemName}`,
                        hostEmailMessage
                    );
                    console.log(`Email sent to host: ${host.email}`);
                } catch (emailError) {
                    console.error('Error sending email to host:', emailError);
                }
            }

        // Send confirmation email to bidder
        const bidderEmailMessage = `
            <h2>Bid Confirmation</h2>
            <p>Your bid has been successfully placed!</p>
            <p>Item: ${auction.itemName}</p>
            <p>Your Bid: $${amount.toLocaleString()}</p>
            <p>Time: ${now.toLocaleString()}</p>
            <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
        `;
        // Get bidder's email from populated User document
        const bidder = await User.findById(id);
        if (bidder && bidder.email) {
            try {
                await sendMail(
                    bidder.email,
                    `Bid Confirmation - ${auction.itemName}`,
                    bidderEmailMessage
                );
                console.log(`Email sent to bidder: ${bidder.email}`);
            } catch (emailError) {
                console.error('Error sending email to bidder:', emailError);
            }
        } else {
            console.error('Bidder email not found');
        }
        } catch (saveError) {
            console.error('Error saving bid:', saveError);
            return res.status(500).json({
                message: 'Error saving bid',
                error: saveError.message
            });
        }

        return res.status(200).json({
            ...auction.toObject(),
            serverTime: now
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// exports.checkAuctionStatus = async (req, res) => {
//     const { auctionId } = req.params;

//     try {
//         const auction = await Auction.findById(auctionId).populate('event');

//         if (!auction) {
//             return res.status(404).json({ message: 'Auction not found' });
//         }

//         const now = new Date();
//         const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

//         // Only try to update status if it's currently active and time has passed
//         if (now > auctionEndTime && auction.status === 'active') {
//             try {
//                 auction.status = 'finished';
//                 await auction.save();

//                 // Fetch the host's email
//                 const host = await User.findById(auction.event.host);
//                 if (!host || !host.email) {
//                     console.error('Host or host email not found');
//                     throw new Error('Host email not found');
//                 }

//                 // Send emails when auction ends
//                 if (auction.bids.length > 0) {
//                     // Find the winning bid
//                     const winningBid = auction.bids.reduce((prev, current) =>
//                         (prev.amount > current.amount) ? prev : current
//                     );

//                     // Send email to winner
//                     const winner = await User.findById(winningBid.bidder);
//                     if (winner && winner.email) {
//                         const winnerEmailMessage = `
//                             <h2>Congratulations! You've Won the Auction!</h2>
//                             <p>You are the winning bidder for "${auction.itemName}"</p>
//                             <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
//                             <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
//                             <p>The event host will contact you soon with further details.</p>
//                         `;
//                         try {
//                             await sendMail(
//                                 winner.email,
//                                 `Auction Won - ${auction.itemName}`,
//                                 winnerEmailMessage
//                             );
//                             console.log(`Email sent to winner: ${winner.email}`);
//                         } catch (emailError) {
//                             console.error('Error sending email to winner:', emailError);
//                         }
//                     } else {
//                         console.error('Winner email not found');
//                     }

//                     // Send email to event host about auction end
//                     const hostEmailMessage = `
//                         <h2>Your Auction Has Ended!</h2>
//                         <p>The auction for "${auction.itemName}" has ended.</p>
//                         <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
//                         <p>Winner Email: ${winner.email}</p>
//                         <p>Please contact the winner to arrange delivery/payment.</p>
//                     `;
//                     try {
//                         await sendMail(
//                             host.email,
//                             `Auction Ended - ${auction.itemName}`,
//                             hostEmailMessage
//                         );
//                         console.log(`Email sent to host: ${host.email}`);
//                     } catch (emailError) {
//                         console.error('Error sending email to host:', emailError);
//                     }
//                 } else {
//                     // Send email to host if no bids were placed
//                     const noBidsMessage = `
//                         <h2>Your Auction Has Ended</h2>
//                         <p>The auction for "${auction.itemName}" has ended.</p>
//                         <p>Unfortunately, no bids were placed on this item.</p>
//                         <p>End Time: ${auctionEndTime.toLocaleString()}</p>
//                     `;
//                     try {
//                         await sendMail(
//                             host.email,
//                             `Auction Ended - ${auction.itemName}`,
//                             noBidsMessage
//                         );
//                         console.log(`Email sent to host: ${host.email}`);
//                     } catch (emailError) {
//                         console.error('Error sending email to host:', emailError);
//                     }
//                 }
//             } catch (saveError) {
//                 console.error('Error updating auction status:', saveError);
//                 return res.status(500).json({
//                     message: 'Error updating auction status',
//                     error: saveError.message
//                 });
//             }
//         }

//         return res.status(200).json({
//             status: auction.status,
//             serverTime: now,
//             auctionEndTime: auctionEndTime
//         });
//     } catch (error) {
//         console.error('Error checking auction status:', error);
//         return res.status(500).json({
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };
