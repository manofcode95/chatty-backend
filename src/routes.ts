import { authRouter } from '@auth/routers/auth.router';
import { userRouter } from '@auth/routers/user.router';
import { commentRouter } from '@comment/routes/comment.router';
import { postRouter } from '@post/routers/post.router';
import { reactionRouter } from '@root/features/reaction/routes/reaction.router';
import { currentUserMiddleware } from '@root/shared/globals/middlewares/current-user.middleware';
import { serverAdapter } from '@services/queue/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, userRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, postRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, reactionRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, commentRouter.routes());
  };

  routes();
};
