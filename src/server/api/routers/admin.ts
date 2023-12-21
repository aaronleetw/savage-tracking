import { compare, compareSync } from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { createTRPCRouter, loggedInProcedure, publicProcedure } from "~/server/api/trpc";
import { LoginSchema, PublicUserType } from "~/utils/types";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
    isLoggedIn: loggedInProcedure.query(() => true),
    login: publicProcedure
        .input(LoginSchema)
        .mutation(async ({ input, ctx }) => await ctx.db.user.findUnique({
                where: {
                    username: input.username,
                }
            }).then((user) => {
                const result = compareSync(input.password, user?.password || "");
                if (result) {
                    console.log(user)
                    console.log(PublicUserType.parse({
                        grade: user?.grade,
                        class: user?.class,
                        name: user?.name,
                        username: user?.username,
                        isAdmin: user?.isAdmin,
                    }))
                    const session = PublicUserType.parse(user)!;
                    console.log(session)
                    const token = jwt.sign(session, process.env.JWT_SECRET || "", { expiresIn: "1d" });
                    ctx.res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24};`);
                    return {
                        status: "success",
                        message: "Login successful.",
                    };
                } else {
                    throw new Error("Please check your username and password.");
                }
            }).catch((err) => {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Please check your username and password.",
                })
            })
        ),
    logout: loggedInProcedure
        .mutation(async ({ ctx }) => {
            ctx.res.setHeader("Set-Cookie", `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
            return {
                status: "success",
                message: "Logout successful.",
            };
        }),
    session: loggedInProcedure
        .query(async ({ ctx }) => {
            return ctx.session;
        }),
});
