declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      tipoPerfil: string;
      statusConta: string;
    };
    shareToken?: any;
  }
}
