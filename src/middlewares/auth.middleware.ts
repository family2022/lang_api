import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../prisma/client';
import { ExpressFunction } from '../utils/types';
import env from '../utils/env';

const prisma = new PrismaClient();

export const isAuthorized: ExpressFunction = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Access denied' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        office: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Access denied' });
    } else if (['DEACTIVATED', 'BLOCKED'].includes(user.status)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message:
          'Your account is currently deactivated. Please contact support for assistance.',
      });
    }

    req.user = {
      ...user,
      password: undefined,
      officeId: user.officeId === null ? undefined : user.officeId,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Access denied' });
  }
};

export const probablyAuthorized: ExpressFunction = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!decoded || !decoded.userId) {
        return res
          .status(401)
          .json({ error: 'Unauthorized', message: 'Access denied' });
      }
      req.user = { ...user, password: undefined };
    }
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Access denied' });
  }
};

export const authorizationRole = (acceptedRoles: string[]): ExpressFunction => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      if (!acceptedRoles.includes(userRole)) {
        return res.status(403).json({
          message: 'You do not have permission to access this resource.',
        });
      }

      // Role is authorized, proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'An error occurred while verifying roles.' });
    }
  };
};
