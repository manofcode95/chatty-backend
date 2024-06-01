import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse, reactionData } from '@root/mocks/reactions.mock';
import { reactionService } from '@services/db/reaction.service';
import { reactionCache } from '@services/redis/reaction.cache';
import { getReactionController } from '@reaction/controllers/get-reaction.controller';
import { postMockData } from '@root/mocks/post.mock';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/reaction.cache');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('getReactions', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionCache, 'getReactionsFromCache').mockResolvedValue({ list: [reactionData], length: 1 });

      await getReactionController.getReactions(req, res);
      expect(reactionCache.getReactionsFromCache).toHaveBeenCalledWith(`${postMockData._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionCache, 'getReactionsFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });

      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue({ list: [reactionData], length: 1 });

      await getReactionController.getReactions(req, res);
      expect(reactionService.getPostReactions).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });
  });

  describe('getSingleReactionByUsername', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionCache, 'getSingleReactionByUsernameFromCache').mockResolvedValue(reactionData);

      await getReactionController.getSingleReactionByUsername(req, res);
      expect(reactionCache.getSingleReactionByUsernameFromCache).toHaveBeenCalledWith(`${postMockData._id}`, postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reaction: reactionData
      });
    });

    it('should send correct json response if cache fails', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionCache, 'getSingleReactionByUsernameFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });

      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue(reactionData);

      await getReactionController.getSingleReactionByUsername(req, res);
      expect(reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(postMockData._id),
        postMockData.username
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reaction: reactionData
      });
    });
  });

  describe('reactionsByUsername', () => {
    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue({ list: [reactionData], length: 1 });

      await getReactionController.getReactionsByUsername(req, res);
      expect(reactionService.getReactionsByUsername).toHaveBeenCalledWith(postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All user reactions by username',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue({ list: [], length: 0 });

      await getReactionController.getReactionsByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All user reactions by username',
        reactions: [],
        count: 0
      });
    });
  });
});
