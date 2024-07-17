import { addImageController } from '@image/controllers/add-image.controller';
import { deleteImageController } from '@image/controllers/delete-image.controller';
import { getImageController } from '@image/controllers/get-images.controller';
import { Router, Request, Response } from 'express';

class ImageRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/images/:userId', (req: Request, res: Response) => getImageController.images(req, res));
    this.router.post('/images/profile', (req: Request, res: Response) => addImageController.profileImage(req, res));
    this.router.post('/images/background', (req: Request, res: Response) => addImageController.backgroundImage(req, res));
    this.router.delete('/images/:imageId', (req: Request, res: Response) => deleteImageController.image(req, res));
    this.router.delete('/images/background/:bgImageId', (req: Request, res: Response) => deleteImageController.backgroundImage(req, res));

    return this.router;
  }
}

export const imageRouter: ImageRouter = new ImageRouter();
