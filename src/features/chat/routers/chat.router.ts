import { addMessageController } from '@chat/controllers/add-message.controller';
import { getMessagesController } from '@chat/controllers/get-messages.controller';
import { Router, Request, Response } from 'express';

class ChatRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/chat/conversation-list', (req: Request, res: Response) => getMessagesController.getConversationList(req, res));
    this.router.get('/chat/messages/:conversationId', (req: Request, res: Response) => getMessagesController.getMessages(req, res));
    this.router.post('/chat/message', (req: Request, res: Response) => addMessageController.addMessage(req, res));
    // this.router.post('/chat/message/add-chat-users', authMiddleware.checkAuthentication, Add.prototype.addChatUsers);
    // this.router.post('/chat/message/remove-chat-users', authMiddleware.checkAuthentication, Add.prototype.removeChatUsers);
    // this.router.put('/chat/message/mark-as-read', authMiddleware.checkAuthentication, Update.prototype.message);
    // this.router.put('/chat/message/reaction', authMiddleware.checkAuthentication, Message.prototype.reaction);
    // this.router.delete(
    //   '/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
    //   authMiddleware.checkAuthentication,
    //   Delete.prototype.markMessageAsDeleted
    // );

    return this.router;
  }
}

export const chatRouter: ChatRouter = new ChatRouter();
