import { addCommentController } from '@comment/controllers/add-comment.controller';
import { getCommentController } from '@comment/controllers/get-comment.controller';
import { Request, Response, Router } from 'express';

class CommentRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/comment', (req: Request, res: Response) => addCommentController.addComment(req, res));
    this.router.get('/comments/:postId', (req: Request, res: Response) => getCommentController.getComments(req, res));
    this.router.get('/comments-names/:postId', (req: Request, res: Response) => getCommentController.getCommentsNamesByPost(req, res));
    this.router.get('/comment/:postId/:commentId', (req: Request, res: Response) => getCommentController.getSingleCommentById(req, res));

    return this.router;
  }
}

export const commentRouter: CommentRouter = new CommentRouter();
