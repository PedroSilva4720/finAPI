import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes';

const app = express();

app.use(express.json());

app.use(router);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error) {
    res.send(error);
  }
});

app.listen(9001);
