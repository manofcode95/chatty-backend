import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postCache } from '@services/redis/post.cache';
import { getPostsController } from '@post/controllers/get-posts.controller';
import { postService } from '@services/db/post.service';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/post.cache');

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsFromCache').mockResolvedValue([postMockData]);
      jest.spyOn(postCache, 'getTotalPostsInCache').mockResolvedValue(1);
      await getPostsController.getPosts(req, res);
      expect(postCache.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(postCache, 'getTotalPostsInCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);
      jest.spyOn(postService, 'getPostCount').mockResolvedValue(1);

      await getPostsController.getPosts(req, res);
      expect(postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(postCache, 'getTotalPostsInCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([]);
      jest.spyOn(postService, 'getPostCount').mockResolvedValue(0);

      await getPostsController.getPosts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [],
        totalPosts: 0
      });
    });
  });

  describe('postWithImages', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsWithImagesFromCache').mockResolvedValue([postMockData]);

      await getPostsController.postsWithImages(req, res);
      expect(postCache.getPostsWithImagesFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: [postMockData]
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsWithImagesFromCache').mockResolvedValue([]);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);

      await getPostsController.postsWithImages(req, res);
      expect(postService.getPosts).toHaveBeenCalledWith({ imgId: '$ne', gifUrl: '$ne' }, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: [postMockData]
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, undefined, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsWithImagesFromCache').mockResolvedValue([]);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([]);

      await getPostsController.postsWithImages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: []
      });
    });
  });
});
