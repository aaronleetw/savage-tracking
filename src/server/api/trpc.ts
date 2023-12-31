/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { PublicUserType } from "~/utils/types";
import jwt from "jsonwebtoken";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = Record<string, never>;

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  // Get JWT from cookie
  const token = _opts.req.cookies.token;

  // Verify JWT
  let session = PublicUserType.parse(undefined);
  try {
    jwt.verify(token || "", process.env.JWT_SECRET || "", (err, decoded) => {
      if (err) {
        session = undefined;
      } else {
        session = PublicUserType.parse(decoded);
      }
    });
  } catch (err) {
    session = undefined;
  }

  // Request and Response objects
  const { req, res } = _opts;

  return {
    session,
    db,
    req,
    res
  };
};

export type Context = ReturnType<typeof createTRPCContext>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const middleware = t.middleware;

const isLoggedIn = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in" });
  }
  return opts.next(opts);
})

const isAdmin = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session?.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not an admin" });
  }
  return opts.next(opts);
})

export const loggedInProcedure = publicProcedure.use(isLoggedIn);
export const adminProcedure = publicProcedure.use(isLoggedIn).use(isAdmin);