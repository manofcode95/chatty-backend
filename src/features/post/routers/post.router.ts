import { createPostController } from '@post/controllers/create-post.controller';
import { deletePostController } from '@post/controllers/delete-post.controller';
import { getPostsController } from '@post/controllers/get-posts.controller';
import { updatePostController } from '@post/controllers/update-post.controller';
import { Router, Request, Response } from 'express';

class PostRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/post/all', (req: Request, res: Response) => getPostsController.getPosts(req, res));
    this.router.get('/post/images', (req: Request, res: Response) => getPostsController.postsWithImages(req, res));
    this.router.get('/post/videos', (req: Request, res: Response) => getPostsController.postsWithVideos(req, res));
    this.router.post('/post', (req: Request, res: Response) => createPostController.createPost(req, res));
    this.router.post('/post/post-image', (req: Request, res: Response) => createPostController.createPostWithImage(req, res));
    this.router.delete('/post/:postId', (req: Request, res: Response) => deletePostController.deletePost(req, res));
    this.router.put('/post/:postId', (req: Request, res: Response) => updatePostController.updatePost(req, res));
    this.router.put('/post/image/:postId', (req: Request, res: Response) => updatePostController.updatePostWithImage(req, res));
    return this.router;
  }
}

export const postRouter = new PostRouter();
