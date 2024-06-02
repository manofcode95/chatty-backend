import { addReactionController } from '@reaction/controllers/add-reaction.controller';
import { getReactionController } from '@reaction/controllers/get-reaction.controller';
import { removeReactionController } from '@reaction/controllers/remove-reaction.controller';
import { Router, Request, Response } from 'express';

class ReactionRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/reactions/:postId', (req: Request, res: Response) => getReactionController.getReactions(req, res));

    this.router.get('/reaction/:postId/:username', (req: Request, res: Response) =>
      getReactionController.getSingleReactionByUsername(req, res)
    );

    this.router.get('/reactions/username/:username', (req: Request, res: Response) =>
      getReactionController.getReactionsByUsername(req, res)
    );

    this.router.post('/reactions', (req: Request, res: Response) => addReactionController.addReaction(req, res));

    this.router.delete('/reaction/:postId/:type', (req: Request, res: Response) => removeReactionController.removeReaction(req, res));

    return this.router;
  }
}

export const reactionRouter = new ReactionRouter();
