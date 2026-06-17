import { chatRepository } from '../../infrastructure/persistence/repositories/chat.repository';
import { productRepository } from '../../infrastructure/persistence/repositories/product.repository';
import { reservationRepository } from '../../infrastructure/persistence/repositories/reservation.repository';
import { transactionRepository } from '../../infrastructure/persistence/repositories/transaction.repository';
import {
  assertChatAccess,
  validateConfirmDelivery,
  validateMessageContent,
  validateOpenChat,
  validateSendMessage,
} from '../../domain/validators/chat.validator';
import { assertProductExists } from '../../domain/validators/product.validator';

export const chatService = {
  async getMyChats(userId: string) {
    return chatRepository.findByUser(userId);
  },

  async getById(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    assertChatAccess(chat, userId);
    return chat;
  },

  async openChat(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    validateOpenChat(product, buyerId);

    const existing = await chatRepository.findByProductAndBuyer(productId, buyerId);
    if (existing) return existing;

    return chatRepository.create(productId, buyerId, product.seller_id);
  },

  async getMessages(chatId: string, userId: string) {
    await chatService.getById(chatId, userId);
    return chatRepository.getMessages(chatId);
  },

  async sendMessage(chatId: string, senderId: string, content: string) {
    validateMessageContent(content);

    const chat = await chatRepository.findById(chatId);
    validateSendMessage(chat, senderId);

    return chatRepository.createMessage(chatId, senderId, content.trim());
  },

  async confirmDelivery(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    validateConfirmDelivery(chat, userId);

    const product = await productRepository.findById(chat.product_id);
    assertProductExists(product);

    const reservation = await reservationRepository.findLatestByProductAndBuyer(
      chat.product_id,
      chat.buyer_id
    );

    await transactionRepository.completeSale({
      chatId,
      productId: chat.product_id,
      sellerId: chat.seller_id,
      buyerId: chat.buyer_id,
      finalPrice: product.price,
      reservationId: reservation?.id ?? null,
    });

    return { message: 'Entrega confirmada. Transacción registrada en el historial.' };
  },
};
