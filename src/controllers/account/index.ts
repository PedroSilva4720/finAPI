import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import cuid from 'cuid';
import { type } from 'os';
import { json } from 'stream/consumers';

export const createAccount = async (req: Request, res: Response) => {
  const { userName, cpf } = req.body;

  try {
    await prisma.account.create({
      data: {
        userName,
        bankStatement: {},
        cpf: `${cpf}`,
        moneyAmount: 0,
        createdAt: new Date(),
      },
    });

    return res.json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    throw new Error(error);
  }
};

export const getAccountStatement = async (req: Request, res: Response) => {
  const uniqueIdentify = req.query.cpf || req.query.id;

  try {
    const accountStatement = await prisma.account.findFirst({
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
        bankStatement: true,
      },
    });

    return res.send(accountStatement);
  } catch (error) {
    throw new Error(error);
  }
};

export const accountDeposit = async (req: Request, res: Response) => {
  const { value } = req.body;
  const uniqueIdentify = req.query.cpf || req.query.id;

  try {
    let { moneyAmount, bankStatement } = await prisma.account.findFirst({
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
        bankStatement: true,
        moneyAmount: true,
      },
    });

    bankStatement.push({
      id: cuid(),
      value,
      type: 'deposit',
      createdAt: new Date().toISOString(),
    });

    await prisma.account.update({
      where: {
        cpf: `${uniqueIdentify}`,
      },
      data: {
        bankStatement: bankStatement.filter(
          item => Object.keys(item).length != 0
        ),
        moneyAmount: moneyAmount + value,
      },
    });
    return res.send('Depósito realizado com sucesso!');
  } catch (error) {
    throw new Error(error);
  }
};

export const accountWithdraw = async (req: Request, res: Response) => {
  const { value } = req.body;
  const uniqueIdentify = req.query.cpf || req.query.id;
  try {
    const { moneyAmount, bankStatement } = await prisma.account.findFirst({
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
        bankStatement: true,
        moneyAmount: true,
      },
    });

    await prisma.account.update({
      where: {
        cpf: `${uniqueIdentify}`,
      },
      data: {
        bankStatement: [
          ...bankStatement,
          {
            id: cuid(),
            value,
            type: 'withdraw',
            createdAt: new Date().toISOString(),
          },
        ].map(item => {
          if (Object.keys(item).length != 0) {
            return item;
          }
        }),

        moneyAmount: moneyAmount - value,
      },
    });
    return res.send('Saque realizado com sucesso!');
  } catch (error) {
    throw new Error(error);
  }
};

export const getClientInfo = async (req: Request, res: Response) => {
  const uniqueIdentify = req.query.cpf || req.query.id;

  try {
    const client = await prisma.account.findFirst({
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

    return res.send(client);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const cpf: any = req.query.cpf;

  try {
    await prisma.account.delete({
      where: {
        cpf: `${cpf}`,
      },
    });

    return res.send('Cliente excluído com sucesso');
  } catch (error) {
    throw new Error(error);
  }
};

export const changeUserName = async (req: Request, res: Response) => {
  const cpf: any = req.query.cpf;
  const { userName } = req.body;

  try {
    await prisma.account.update({
      where: {
        cpf: `${cpf}`,
      },
      data: {
        userName,
      },
    });

    return res.send('Alterado com sucesso!');
  } catch (error) {
    throw new Error(error);
  }
};

export const filterAccountByDate = async (req: Request, res: Response) => {
  const uniqueIdentify = req.query.cpf || req.query.id;

  const { initialDate, endDate } = req.body;

  try {
    const accountStatement = await prisma.account.findFirst({
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
        bankStatement: true,
      },
    });

    const filteredStatement = accountStatement.bankStatement
      .filter(item => new Date(Object(item).createdAt) >= new Date(initialDate))
      .filter(item => new Date(Object(item).createdAt) <= new Date(endDate));

    return res.send(filteredStatement);
  } catch (error) {
    throw new Error(error);
  }
};
