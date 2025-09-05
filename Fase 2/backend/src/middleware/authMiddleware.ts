import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any; // acá guardamos los datos decodificados del token
}

export const tokenAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token no válido' });
    }
}