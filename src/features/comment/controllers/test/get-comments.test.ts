import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentCache } from '@services/redis/comment.cache';
import { getCommentController } from '@comment/controllers/get-comment.controller';
import { commentService } from '@services/db/comment.service';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { commentNames, commentsData } from '@mocks/comment.mock';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/queue/comment.queue');
jest.mock('@services/redis/comment.cache');
describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();

      jest.spyOn(commentCache, 'getCommentsFromCache').mockResolvedValue([commentsData]);

      await getCommentController.getComments(req, res);
      // expect(commentCache.getCommentsFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getCommentsFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });
      jest.spyOn(commentService, 'getPostComments').mockResolvedValue([commentsData]);

      await getCommentController.getComments(req, res);
      expect(commentService.getPostComments).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });
  });

  describe('commentsNamesFromCache', () => {
    it('should send correct json response if data exist in redis', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getCommentsNamesFromCache').mockResolvedValue(commentNames);

      await getCommentController.getCommentsNamesByPost(req, res);
      expect(commentCache.getCommentsNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames
      });
    });

    it('should send correct json response if data exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getCommentsNamesFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });
      jest.spyOn(commentService, 'getPostCommentNames').mockResolvedValue(commentNames);

      await getCommentController.getCommentsNamesByPost(req, res);
      expect(commentService.getPostCommentNames).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames
      });
    });

    it('should return empty comments if data does not exist in redis and database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getCommentsNamesFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });

      jest.spyOn(commentService, 'getPostCommentNames').mockResolvedValue({ names: [], count: 0 });

      await getCommentController.getCommentsNamesByPost(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: {
          names: [],
          count: 0
        }
      });
    });
  });

  describe('singleComment', () => {
    it('should send correct json response from cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getSingleCommentFromCache').mockResolvedValue(commentsData);

      await getCommentController.getSingleCommentById(req, res);
      expect(commentCache.getSingleCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', '6064861bc25eaa5a5d2f9bf4');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comment: commentsData
      });
    });

    it('should send correct json response from database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(commentCache, 'getSingleCommentFromCache').mockImplementation(() => {
        throw new Error('Test error');
      });
      jest.spyOn(commentService, 'getPostComments').mockResolvedValue([commentsData]);

      await getCommentController.getSingleCommentById(req, res);
      expect(commentService.getPostComments).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comment: commentsData
      });
    });
  });
});
