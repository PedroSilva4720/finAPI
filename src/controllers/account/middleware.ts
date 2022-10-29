import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma';

export const verifyExistentAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uniqueIdentify = req.query.cpf || req.query.id;

  const user = await prisma.account.findFirst({
    where: {
      OR: [
        {
          cpf: `${uniqueIdentify}`,
        },
        {
          id: `${uniqueIdentify}`,
        },
      ],
    },
  });

  if (!user) {
    return res.send('Usuário não encontrado!');
  } else {
    return next();
  }
};
export const verifyInexistentAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cpf } = req.body;

  const user = await prisma.account.findFirst({
    where: {
      cpf: `${cpf}`,
    },
  });

  if (!!user) {
    return res.send('Usuário ja existente!');
  } else {
    return next();
  }
};

export const verifyAccountAmountIsEnough = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uniqueIdentify = req.query.cpf || req.query.id;

  const { value } = req.body;

  const { moneyAmount } = await prisma.account.findFirst({
    where: {
      OR: [
        {
          cpf: `${uniqueIdentify}`,
        },
        {
          id: `${uniqueIdentify}`,
        },
      ],
    },
    select: {
      moneyAmount: true,
    },
  });

  if (moneyAmount < value) {
    return res.status(400).send('Saldo insuficiente!');
  } else {
    return next();
  }
};
