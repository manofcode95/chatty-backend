import { authRouter } from '@auth/routers/auth.router';
import { userRouter } from '@user/routers/user.router';
import { commentRouter } from '@comment/routers/comment.router';
import { followerRouter } from '@follower/routers/follower.router';
import { postRouter } from '@post/routers/post.router';
import { reactionRouter } from '@root/features/reaction/routers/reaction.router';
import { currentUserMiddleware } from '@root/shared/globals/middlewares/current-user.middleware';
import { serverAdapter } from '@services/queue/base.queue';
import { Application } from 'express';
import { notificationRouter } from '@notification/routes/notification.router';
import { chatRouter } from '@chat/routers/chat.router';
import { healthRouter } from './features/health/routers/health.router';
import { imageRouter } from '@image/routers/image.router';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(healthRouter.routes());
    app.use(BASE_PATH, authRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, userRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, postRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, reactionRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, commentRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, followerRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, notificationRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, chatRouter.routes());
    app.use(BASE_PATH, currentUserMiddleware.checkAuthentication, imageRouter.routes());
  };

  routes();
};
