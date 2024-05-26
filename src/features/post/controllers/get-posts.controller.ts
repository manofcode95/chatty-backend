import { IPostDocument } from '@post/interfaces/post.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postCache } from '@services/redis/post.cache';
import { postService } from '@services/db/post.service';

const PAGE_SIZE = 10;

export class GetPostsController {
  public async getPosts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const skip: number = (page - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * page;
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    let totalPosts = 0;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.getPostCount();
    }
    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const skip: number = (page - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * page;
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }

  public async postsWithVideos(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const skip: number = (page - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * page;
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithVideosFromCache('post', newSkip, limit);
    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ videoId: '$ne' }, skip, limit, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with videos', posts });
  }
}

export const getPostsController = new GetPostsController();
