import { Router, Request, Response } from 'express';
import moment from 'moment';
import axios from 'axios';
import { performance } from 'perf_hooks';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';

class HealthRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/health', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`Health: Server instance is healthy with process id ${process.pid} on ${moment().format('LL')}`);
    });

    this.router.get('/env', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`This is the ${config.NODE_ENV} environment.rfrgrg5t3e2e3e3r4g5g`);
    });

    this.router.get('/instance', async (req: Request, res: Response) => {
      const response = await axios({
        method: 'get',
        url: config.EC2_URL
      });
      res
        .status(HTTP_STATUS.OK)
        .send(`Server is running on EC2 instance with id ${response.data} and process id ${process.pid} on ${moment().format('LL')}`);
    });

    this.router.get('/fibo/:num', async (req: Request, res: Response) => {
      const { num } = req.params;
      const start: number = performance.now();
      const result: number = this.fibo(parseInt(num, 10));
      const end: number = performance.now();
      // const response = await axios({
      //   method: 'get',
      //   url: config.EC2_URL
      // });
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Fibonacci series of ${num} is ${result} and it took ${end - start}ms and runs with process id ${process.pid} at ${moment().format('LL')}`
        );
    });

    return this.router;
  }

  private fibo(data: number): number {
    if (data < 2) {
      return 1;
    } else {
      return this.fibo(data - 2) + this.fibo(data - 1);
    }
  }
}

export const healthRouter: HealthRouter = new HealthRouter();