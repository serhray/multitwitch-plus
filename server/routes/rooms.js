const express = require('express');
const router = express.Router();

// In-memory storage for rooms (in production, use a database)
let rooms = {};
let roomVotes = {};

// Create a new room
router.post('/create', (req, res) => {
  try {
    const { roomName, channels, creatorId } = req.body;
    const roomId = generateRoomId();
    
    rooms[roomId] = {
      id: roomId,
      name: roomName,
      channels: channels || [],
      creator: creatorId,
      users: [],
      focusedStream: channels?.[0] || null,
      createdAt: new Date(),
      settings: {
        allowVoting: true,
        autoFocus: true,
        chatTranslation: true
      }
    };

    roomVotes[roomId] = {};

    res.json({ 
      success: true, 
      room: rooms[roomId] 
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join a room
router.post('/join/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, username } = req.body;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const user = { id: userId, username, joinedAt: new Date() };
    
    // Remove user if already in room (rejoin)
    rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== userId);
    rooms[roomId].users.push(user);

    res.json({ 
      success: true, 
      room: rooms[roomId] 
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Leave a room
router.post('/leave/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== userId);
    
    // Clean up votes
    if (roomVotes[roomId]) {
      delete roomVotes[roomId][userId];
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Get room info
router.get('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room: rooms[roomId] });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Vote for stream focus
router.post('/:roomId/vote', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, streamId } = req.body;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!rooms[roomId].settings.allowVoting) {
      return res.status(403).json({ error: 'Voting not allowed in this room' });
    }

    // Initialize votes for room if not exists
    if (!roomVotes[roomId]) {
      roomVotes[roomId] = {};
    }

    // Record vote
    roomVotes[roomId][userId] = streamId;

    // Count votes
    const voteCounts = {};
    Object.values(roomVotes[roomId]).forEach(vote => {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });

    // Find stream with most votes
    const topStream = Object.keys(voteCounts).reduce((a, b) => 
      voteCounts[a] > voteCounts[b] ? a : b
    );

    // Update focused stream if it changed
    if (topStream && topStream !== rooms[roomId].focusedStream) {
      rooms[roomId].focusedStream = topStream;
    }

    res.json({ 
      success: true, 
      votes: voteCounts,
      focusedStream: rooms[roomId].focusedStream
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Update room settings
router.put('/:roomId/settings', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, settings } = req.body;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only room creator can update settings
    if (rooms[roomId].creator !== userId) {
      return res.status(403).json({ error: 'Only room creator can update settings' });
    }

    rooms[roomId].settings = { ...rooms[roomId].settings, ...settings };

    res.json({ 
      success: true, 
      settings: rooms[roomId].settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Add channel to room
router.post('/:roomId/channels', (req, res) => {
  try {
    const { roomId } = req.params;
    const { channel } = req.body;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!rooms[roomId].channels.includes(channel)) {
      rooms[roomId].channels.push(channel);
    }

    res.json({ 
      success: true, 
      channels: rooms[roomId].channels 
    });
  } catch (error) {
    console.error('Error adding channel:', error);
    res.status(500).json({ error: 'Failed to add channel' });
  }
});

// Remove channel from room
router.delete('/:roomId/channels/:channel', (req, res) => {
  try {
    const { roomId, channel } = req.params;

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    rooms[roomId].channels = rooms[roomId].channels.filter(c => c !== channel);

    res.json({ 
      success: true, 
      channels: rooms[roomId].channels 
    });
  } catch (error) {
    console.error('Error removing channel:', error);
    res.status(500).json({ error: 'Failed to remove channel' });
  }
});

// Generate random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = router;
