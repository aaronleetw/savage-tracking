import { PrismaClient } from '@prisma/client';
import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import jwt from 'jsonwebtoken';
import { PublicUserType } from '~/utils/types';
 
/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function myCreateContext(opts: CreateNextContextOptions) {
    // Get JWT from cookie
    const token = opts.req.cookies.token;

    // Verify JWT
    let session = PublicUserType.parse(undefined);
    try {
        jwt.verify(token ?? "", process.env.JWT_SECRET ?? "", (err, decoded) => {
            if (err) {
                console.log(err);
            } else {
                session = PublicUserType.parse(decoded);
            }
        });    
    } catch (err) {
        session = undefined;
    }

    // Create Prisma client
    const prisma = new PrismaClient();

    // Request and Response objects
    const { req, res } = opts;
 
    return {
        session,
        prisma,
        req,
        res
    };
}
 
export type Context = inferAsyncReturnType<typeof myCreateContext>;