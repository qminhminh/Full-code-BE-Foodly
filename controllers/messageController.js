const Message = require('../models/Message');
const mongoose = require('mongoose');

module.exports = {
   getAllMessages : async (req, res) => {
    const { restaurantId, customerId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid restaurantId or customerId' });
    }
  
    try {
      const messages = await Message.find({ restaurantId, customerId }).sort('createdAt'); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getAllMessagesResCount : async (req, res) => {
    const { restaurantId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(restaurantId) ) {
      return res.status(400).json({ error: 'Invalid restaurantId or customerId' });
    }
  
    try {
      const messages = await Message.find({ restaurantId }); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllMessagesCustomerCount : async (req, res) => {
    const { customerId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(customerId) ) {
      return res.status(400).json({ error: 'Invalid customerId or customerId' });
    }
  
    try {
      const messages = await Message.find({ customerId }); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllMessagesDriverCount : async (req, res) => {
    const { driverId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(driverId) ) {
      return res.status(400).json({ error: 'Invalid driverId or driverId' });
    }
  
    try {
      const messages = await Message.find({ driverId }); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getAllMessagesDriver : async (req, res) => {
    const { driverId, customerId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid restaurantId or customerId' });
    }
  
    try {
      const messages = await Message.find({ driverId, customerId }).sort('createdAt'); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getAllMessagesDriverandRes : async (req, res) => {
    const { restaurantId, driverId } = req.params;
     
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Invalid restaurantId or customerId' });
    }
  
    try {
      const messages = await Message.find({ restaurantId, driverId }).sort('createdAt'); // Đảm bảo sort theo trường hợp đúng
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllGetUsersMessages : async (req, res) => {
    const { restaurantId } = req.params;
  
    // Kiểm tra tính hợp lệ của restaurantId và customerId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurantId or customerId' });
    }
  
    try {
      const messages = await Message.find({restaurantId})
      .select('-message -createdAt -sender')
      .populate({
        path: 'customerId',
        select: "username email phone profile userType",
    });
      res.status(200).json(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
    }
  },
  
};
