import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { CategoriaDado } from '@prisma/client';

export function checkTokenScope(...requiredScopes: CategoriaDado[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const membroId = req.params.membroId;

    if (!user || !membroId) {
      res.status(400).json({ error: 'Parâmetros insuficientes.' });
      return;
    }

    const token = await prisma.tokenAcesso.findFirst({
      where: {
        profissionalId: user.userId,
        membroId: membroId as string,
        status: 'ATIVO',
        dataExpiracao: { gt: new Date() },
      },
      include: { escopos: true },
    });

    if (!token) {
      res.status(403).json({ error: 'Nenhum token de acesso válido para este membro.' });
      return;
    }

    const grantedScopes = token.escopos.map((e: { categoriaDado: CategoriaDado }) => e.categoriaDado);
    const hasAllScopes = requiredScopes.every((scope) => grantedScopes.includes(scope));

    if (!hasAllScopes) {
      res.status(403).json({ error: 'Escopo de acesso insuficiente.' });
      return;
    }

    await prisma.logAcessoDados.create({
      data: {
        tokenId: token.id,
        profissionalId: user.userId,
        recursoAcessado: `${req.method} ${req.originalUrl}`,
        ipOrigem: req.ip || null,
      },
    });

    (req as any).shareToken = token;
    next();
  };
}
