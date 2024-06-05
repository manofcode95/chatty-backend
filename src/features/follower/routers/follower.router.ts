import { Router, Request, Response } from 'express';
import { followController } from '@follower/controllers/follow-user.controller';
import { unfollowController } from '@follower/controllers/unfollow-user.controller';
import { getFollowingsController } from '@follower/controllers/get-followings.controller';
import { getFollowersController } from '@follower/controllers/get-followers.controller';

class FollowerRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/followings', (req: Request, res: Response) => getFollowingsController.getFollowings(req, res));
    this.router.get('/followers/:userId', (req: Request, res: Response) => getFollowersController.getFollowers(req, res));

    this.router.put('/follow/:followerId', (req: Request, res: Response) => followController.follow(req, res));
    this.router.put('/unfollow/:followerId', (req: Request, res: Response) => unfollowController.unfollow(req, res));

    return this.router;
  }
}

export const followerRouter: FollowerRouter = new FollowerRouter();
