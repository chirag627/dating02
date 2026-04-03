import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: string = 'text',
    mediaUrl?: string,
  ): Promise<MessageDocument> {
    const message = new this.messageModel({
      senderId,
      receiverId,
      content,
      type,
      mediaUrl,
    });
    return message.save();
  }

  async getConversation(userId1: string, userId2: string, page = 1, limit = 50): Promise<MessageDocument[]> {
    const skip = (page - 1) * limit;
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'firstName lastName photos');
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.messageModel.updateMany(
      { senderId, receiverId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({ receiverId: userId, isRead: false });
  }

  async getConversationList(userId: string): Promise<any[]> {
    return this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);
  }
}
