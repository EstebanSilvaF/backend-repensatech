import { prisma } from '../prisma';
import { Chat, Message } from '../../../domain/types/chat.types';
import { decimalToNumber } from '../../../shared/utils/prisma-mappers';

type ChatExtras = {
  product_name?: string;
  product_price?: number;
  product_image?: string;
  buyer_name?: string;
  seller_name?: string;
  last_message?: string;
  last_message_at?: Date;
};

function mapChat(
  row: {
    id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    status: Chat['status'];
    createdAt: Date;
    updatedAt: Date;
  },
  extras?: ChatExtras
): Chat & ChatExtras {
  return {
    id: row.id,
    product_id: row.productId,
    buyer_id: row.buyerId,
    seller_id: row.sellerId,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    ...extras,
  };
}

function mapMessage(
  row: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: Date;
  },
  senderName?: string
): Message & { sender_name?: string } {
  return {
    id: row.id,
    chat_id: row.chatId,
    sender_id: row.senderId,
    content: row.content,
    created_at: row.createdAt,
    ...(senderName ? { sender_name: senderName } : {}),
  };
}

const chatInclude = {
  product: { select: { name: true, price: true, imageUrl: true } },
  buyer: { select: { fullName: true } },
  seller: { select: { fullName: true } },
} as const;

export const chatRepository = {
  async findByProductAndBuyer(productId: string, buyerId: string): Promise<Chat | null> {
    const row = await prisma.chat.findUnique({
      where: { productId_buyerId: { productId, buyerId } },
    });
    return row ? mapChat(row) : null;
  },

  async findById(id: string): Promise<(Chat & ChatExtras) | null> {
    const row = await prisma.chat.findUnique({
      where: { id },
      include: chatInclude,
    });
    if (!row) return null;

    return mapChat(row, {
      product_name: row.product.name,
      product_price: decimalToNumber(row.product.price),
      product_image: row.product.imageUrl,
      buyer_name: row.buyer.fullName,
      seller_name: row.seller.fullName,
    });
  },

  async findByUser(userId: string): Promise<(Chat & ChatExtras)[]> {
    const rows = await prisma.chat.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        ...chatInclude,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const mapped = rows.map((row) =>
      mapChat(row, {
        product_name: row.product.name,
        product_price: decimalToNumber(row.product.price),
        product_image: row.product.imageUrl,
        buyer_name: row.buyer.fullName,
        seller_name: row.seller.fullName,
        last_message: row.messages[0]?.content,
        last_message_at: row.messages[0]?.createdAt,
      })
    );

    return mapped.sort((a, b) => {
      const aTime = a.last_message_at?.getTime() ?? 0;
      const bTime = b.last_message_at?.getTime() ?? 0;
      return bTime - aTime;
    });
  },

  async create(productId: string, buyerId: string, sellerId: string): Promise<Chat> {
    const row = await prisma.chat.create({
      data: { productId, buyerId, sellerId },
    });
    return mapChat(row);
  },

  async confirmDelivery(id: string): Promise<void> {
    await prisma.chat.update({
      where: { id },
      data: { status: 'delivery_confirmed' },
    });
  },

  async getMessages(chatId: string): Promise<(Message & { sender_name?: string })[]> {
    const rows = await prisma.message.findMany({
      where: { chatId },
      include: { sender: { select: { fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => mapMessage(row, row.sender.fullName));
  },

  async createMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const row = await prisma.message.create({
      data: { chatId, senderId, content },
    });
    return mapMessage(row);
  },
};
