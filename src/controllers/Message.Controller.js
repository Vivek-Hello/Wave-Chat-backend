import { Message } from "../models/Message.Model.js";
import { User } from "../models/User.Model.js";


export const CreateMessage = async (req, res) => {
  try {
    const senderId = req.user._id; 
    const { receiverId, content } = req.body; 

    // Check if receiverId belongs to a user
    const user = await User.findById(receiverId);
 


    const messageData = {
      sender: senderId,
      content,
    };

    if (user) {
      messageData.receiver = user._id;
    }
     else {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const message = await Message.create(messageData);

    return res.status(201).json({ message: "Message sent", message });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




export const GetMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    const messages = await Message.find({
      $or: [
        // Messages between two users
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
        // OR messages sent to a group
       
      ]
    }).sort({ createdAt: 1 }); // optional: sort by time

    return res.status(200).json({ messages });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
