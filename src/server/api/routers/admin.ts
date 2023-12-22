import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

import { adminProcedure, createTRPCRouter, loggedInProcedure, publicProcedure } from "~/server/api/trpc";
import { AddPeriods, AddTimePeriodSchema, AddUserSchema, ChgPasswordSchema, LoginSchema, PublicUserType } from "~/utils/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Period } from "@prisma/client";
import { lastGotRfid } from "~/utils/rfid";

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
                const session = PublicUserType.parse(user)!;
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
    chgPassword: loggedInProcedure
        .input(ChgPasswordSchema)
        .mutation(async ({ input, ctx }) => {
            await ctx.db.user.findUnique({
                where: {
                    username: ctx.session?.username,
                }
            }).then(async (user) => {
                const result = compareSync(input.oldPassword, user?.password || "");
                if (result) {
                    await ctx.db.user.update({
                        where: {
                            username: ctx.session?.username,
                        },
                        data: {
                            password: hashSync(input.newPassword, 10),
                        },
                    });
                    return {
                        status: "success",
                        message: "Password changed successfully.",
                    };
                } else {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Please check your old password.",
                    })
                }
            }).catch((err) => {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Please check your old password.",
                })
            })
        }),
    getTimePeriods: loggedInProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.timePeriod.findMany({
                orderBy: {
                    id: "asc",
                },
            });
        }),
    addTimePeriod: adminProcedure
        .input(AddTimePeriodSchema)
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.timePeriod.create({
                data: {
                    id: input.id,
                    name: input.name,
                    start: input.startTime,
                    end: input.endTime,
                },
            });
        }),
    deleteTimePeriod: adminProcedure
        .input(z.number().int())
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.timePeriod.delete({
                where: {
                    id: input,
                },
            });
        }),
    getAllUsers: adminProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.user.findMany({
                orderBy: {
                    username: "asc",
                },
                select: {
                    username: true,
                    name: true,
                    grade: true,
                    class: true,
                    number: true,
                    isAdmin: true,
                    rosterOnly: true,
                    rfid: true,
                }
            });
        }),
    resetPassword: adminProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.user.update({
                where: {
                    username: input,
                },
                data: {
                    password: hashSync("password", 10),
                },
            });
        }),
    toggleUserIsAdmin: adminProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.user.update({
                where: {
                    username: input,
                },
                data: {
                    isAdmin: await ctx.db.user.findUnique({
                        where: {
                            username: input,
                        },
                    }).then((user) => {
                        return !user?.isAdmin;
                    }),
                },
            });
        }),
    toggleUserRosterOnly: adminProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.user.update({
                where: {
                    username: input,
                },
                data: {
                    rosterOnly: await ctx.db.user.findUnique({
                        where: {
                            username: input,
                        },
                    }).then((user) => {
                        return !user?.rosterOnly;
                    }),
                },
            });
        }),
    addUser: adminProcedure
        .input(AddUserSchema)
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.user.create({
                data: {
                    username: input.username,
                    name: input.name,
                    grade: input.grade,
                    class: input.class,
                    number: input.number,
                    password: hashSync("password", 10),
                },
            });
        }),
    getPeriods: loggedInProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.period.findMany({
                orderBy: [{
                    date: "asc",
                }, {
                    timePeriodId: "asc",
                }],
            }).then((periods) => {
                const groupedPeriods: { [key: string]: Period[] } = {};
                periods.forEach((period) => {
                    const utcDate = period.date.toLocaleDateString();
                    if (groupedPeriods[utcDate] === undefined) {
                        groupedPeriods[utcDate] = [];
                    }
                    groupedPeriods[utcDate]?.push(period);
                });
                return groupedPeriods;
            }).catch((err) => {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "There was an error getting the periods.",
                })
            })
        }),
    addPeriods: adminProcedure
        .input(AddPeriods)
        .mutation(async ({ input, ctx }) => {
            await ctx.db.timePeriod.findMany().then(
                async (timePeriods) => {
                    timePeriods.forEach(async (timePeriod) => {
                        await ctx.db.period.create({
                            data: {
                                date: new Date(input.date),
                                timePeriodId: timePeriod.id,
                            },
                        });
                    });
                }
            ).then(() => {
                return {
                    status: "success",
                    message: "Periods added successfully.",
                };
            }).catch((err) => {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "There was an error adding the periods.",
                })
            })
        }),
    enablePeriod: adminProcedure
        .input(z.object({
            date: z.string(),
            timePeriodId: z.number().int(),
        }))
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.period.create({
                data: {
                    date: new Date(input.date),
                    timePeriodId: input.timePeriodId,
                },
            })
        }),
    disablePeriod: adminProcedure
        .input(z.number().int())
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.period.delete({
                where: {
                    id: input,
                },
            })
        }),
    getLastRfid: adminProcedure
        .query(() => {
            return lastGotRfid;
        }),
    setUserRfid: adminProcedure
        .input(z.object({
            username: z.string(),
            rfid: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            return await ctx.db.user.update({
                where: {
                    username: input.username,
                },
                data: {
                    rfid: input.rfid,
                },
            })
        }),
});
