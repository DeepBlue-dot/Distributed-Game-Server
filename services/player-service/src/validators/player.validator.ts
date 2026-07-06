import { z, ZodType  } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
  
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatarUrl: z.url().optional().or(z.literal("")),
  bio: z.string().max(200).optional(),
});

export const updateEmailSchema = z.object({
  email: z.email(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const tokenSchema = z.object({
  token: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
