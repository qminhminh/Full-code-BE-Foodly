const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const compression = require('compression');
const cors = require('cors');
const { fireBaseConnection } = require('./utils/fbConnect');
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const restRoute = require("./routes/restaurant");
const catRoute = require("./routes/category");
const foodRoute = require("./routes/food");
const cartRoute = require("./routes/cart");
const addressRoute = require("./routes/address");
const driverRoute = require("./routes/driver");
const messagingRoute = require("./routes/messaging");
const orderRoute = require("./routes/order");
const ratingRoute = require("./routes/rating");
const uploadRoute =require("./routes/uploads")
const voucherRoute =require("./routes/voucher");
const messageRoute =require("./routes/message");
const Message = require('./models/Message'); 


dotenv.config()

fireBaseConnection();



const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("connected to the db")).catch((err) => { console.log(err) });




app.use(compression({
    level: 6,
    threshold: 0
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use("/", authRoute);
app.use("/api/users", userRoute);
app.use("/api/restaurant", restRoute);
app.use("/api/vouchers", voucherRoute);
app.use("/api/category", catRoute);
app.use("/api/foods", foodRoute);
app.use("/api/cart", cartRoute);
app.use("/api/address", addressRoute);
app.use("/api/driver", driverRoute);
app.use("/api/orders", orderRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/messaging", messagingRoute);
app.use("/api/uploads", uploadRoute);
app.use("/api/chats", messageRoute);


const ip =  "192.168.137.1";

const port = process.env.PORT || 3000; 

app.listen(port, () => {
  console.log(`Product server listening on ${port}`);
});

const ioPort = 5000;
const ioServer = http.createServer(); // Tạo một HTTP server riêng cho Socket.io
const io = new Server(ioServer, {
    cors: { origin: '*' },
});

// Xử lý các sự kiện `Socket.io`
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send_message_res_client', async (data) => {
      const { restaurantId, customerId, message, sender } = data;
    
      // Làm sạch giá trị của customerId
      const cleanedCustomerId = customerId.replace(/"/g, '').trim(); // Loại bỏ dấu nháy kép và khoảng trắng
    
      const newMessage = new Message({restaurantId, customerId: cleanedCustomerId, message, sender, isRead: 'unread' });
      
      try {
        await newMessage.save();
        const room = `${restaurantId}_${cleanedCustomerId}`;
        io.to(room).emit('receive_message_res_client', newMessage);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('send_message_driver_client', async (data) => {
      const {driverId, customerId, message, sender } = data;
    
      // Làm sạch giá trị của customerId
      const cleanedCustomerId = customerId.replace(/"/g, '').trim(); // Loại bỏ dấu nháy kép và khoảng trắng
    
      const newMessage = new Message({driverId, customerId: cleanedCustomerId, message, sender , isRead: 'unread'});
      
      try {
        await newMessage.save();
        const room = `${driverId}_${cleanedCustomerId}`;
        io.to(room).emit('receive_message_driver_client', newMessage);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });
    socket.on('send_message_driver_res', async (data) => {
      const {driverId, restaurantId, message, sender } = data;
    
      // Làm sạch giá trị của customerId
      const cleanedCustomerId = restaurantId.replace(/"/g, '').trim(); // Loại bỏ dấu nháy kép và khoảng trắng
    
      const newMessage = new Message({driverId, restaurantId: cleanedCustomerId, message, sender , isRead: 'unread'});
      
      try {
        await newMessage.save();
        const room = `${restaurantId}_${driverId}`;
        io.to(room).emit('receive_message_driver_res', newMessage);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });
    
    socket.on('edit_message_res_client', async (data) => {
      const { restaurantId, customerId, messageId, message } = data;
      console.log(data);
      // Clean the customerId
     
      const cleanedCustomerId = customerId.replace(/"/g, '').trim();
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { message },
          { new: true }
        );
    
        const room = `${restaurantId}_${cleanedCustomerId}`;
        io.to(room).emit('receive_message_res_client', updatedMessage);
      } catch (err) {
        console.error('Error updating message:', err);
      }
    });

    socket.on('edit_message_res_driver', async (data) => {
      const { restaurantId, driverId, messageId, message } = data;
      console.log(data);
      // Clean the customerId
     
      const cleanedCustomerId = driverId.replace(/"/g, '').trim();
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { message },
          { new: true }
        );
    
        const room = `${restaurantId}_${cleanedCustomerId}`;
        io.to(room).emit('receive_message_driver_res', updatedMessage);
      } catch (err) {
        console.error('Error updating message:', err);
      }
    });

    socket.on('edit_message_driver_client', async (data) => {
      const { driverId, customerId, messageId, message } = data;
      console.log(data);
      // Clean the customerId
     
      const cleanedCustomerId = customerId.replace(/"/g, '').trim();
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { message },
          { new: true }
        );
    
        const room = `${driverId}_${cleanedCustomerId}`;
        io.to(room).emit('receive_message_driver_client', updatedMessage);
      } catch (err) {
        console.error('Error updating message:', err);
      }
    });

  socket.on('delete_message_res_client', async (data) => {
    const { restaurantId, customerId, messageId } = data;
    console.log(data);
    // Check if messageId is provided
    if (!messageId) {
        console.error('No messageId provided for deletion.');
        return; // Early exit if messageId is not provided
    }

    // Delete the message in the database
    try {
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        // Check if the message was found and deleted
        if (deletedMessage) {
            const room = `${restaurantId}_${customerId}`;
            io.to(room).emit('message_deleted', { messageId }); // Emit an event for deleted message
        } else {
            console.error('Message not found for ID:', messageId);
        }
    } catch (err) {
        console.error('Error deleting message:', err);
    }
});

socket.on('delete_message_driver_client', async (data) => {
  const { driverId, customerId, messageId } = data;

  // Check if messageId is provided
  if (!messageId) {
      console.error('No messageId provided for deletion.');
      return; // Early exit if messageId is not provided
  }

  // Delete the message in the database
  try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      // Check if the message was found and deleted
      if (deletedMessage) {
          const room = `${driverId}_${customerId}`;
          io.to(room).emit('message_deleted', { messageId }); // Emit an event for deleted message
      } else {
          console.error('Message not found for ID:', messageId);
      }
  } catch (err) {
      console.error('Error deleting message:', err);
  }
});
socket.on('delete_message_res_driver', async (data) => {
  const { driverId, restaurantId, messageId } = data;

  // Check if messageId is provided
  if (!messageId) {
      console.error('No messageId provided for deletion.');
      return; // Early exit if messageId is not provided
  }

  // Delete the message in the database
  try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      // Check if the message was found and deleted
      if (deletedMessage) {
        const room = `${restaurantId}_${driverId}`;
          io.to(room).emit('message_deleted', { messageId }); // Emit an event for deleted message
      } else {
          console.error('Message not found for ID:', messageId);
      }
  } catch (err) {
      console.error('Error deleting message:', err);
  }
});


    socket.on('join_room_restaurant_client', (data) => {
        const { restaurantId, customerId } = data;
        const room = `${restaurantId}_${customerId}`;
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('join_room_driver_client', (data) => {
      const { driverId, customerId } = data;
      const room = `${driverId}_${customerId}`;
      socket.join(room);
      console.log(`User joined room: ${room}`);
  });
  socket.on('join_room_restaurant_driver', (data) => {
    const { restaurantId, driverId } = data;
    const room = `${restaurantId}_${driverId}`;
    socket.join(room);
    console.log(`User joined room: ${room}`);
});

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Khởi động Socket.io trên cổng 5000
ioServer.listen(ioPort, () => {
    console.log(`Socket.io server listening on port ${ioPort}`);
});

