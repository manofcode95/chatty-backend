import { postQueue } from '@services/queue/post.queue';
import { postCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post.socket';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class DeletePostController {
  public async deletePost(req: Request, res: Response): Promise<void> {
    socketIOPostObject.emit('delete post', req.params.postId);
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);
    postQueue.addPostJob('deletePostFromDb', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}

export const deletePostController = new DeletePostController();
