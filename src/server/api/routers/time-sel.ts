import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, loggedInProcedure, publicProcedure } from "~/server/api/trpc";

export const timeSelRouter = createTRPCRouter({
    getMySelectedPeriods: loggedInProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({ 
                where: { username: ctx.session?.username },
                select: {
                    periods: {
                        select: {
                            id: true,
                        }
                    }
                }
            });
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
            return user.periods.map(period => period.id);
        }),
    toggleAttendance: loggedInProcedure
        .input(z.object({
            periodId: z.number().int(),
            attendance: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                if (input.attendance) {
                    await ctx.db.period.update({
                        where: { id: input.periodId },
                        data: {
                            users: {
                                connect: {
                                    username: ctx.session?.username,
                                }
                            }
                        }
                    });
                } else {
                    await ctx.db.period.update({
                        where: { id: input.periodId },
                        data: {
                            users: {
                                disconnect: {
                                    username: ctx.session?.username,
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "An error occurred." });
            }
            return true;
        }),
    attendTime: loggedInProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({ 
                where: { username: ctx.session?.username },
                select: {
                    periods: {
                        select: {
                            timePeriod: {
                                select: {
                                    start: true,
                                    end: true,
                                }
                            }
                        }
                    }
                }
            });
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
            let total = 0;
            user.periods.forEach(period => {
                const start = new Date();
                const end = new Date();
                const [startHour, startMinute] = period.timePeriod.start.split(":");
                const [endHour, endMinute] = period.timePeriod.end.split(":");
                start.setHours(parseInt(startHour!));
                start.setMinutes(parseInt(startMinute!));
                end.setHours(parseInt(endHour!));
                end.setMinutes(parseInt(endMinute!));
                total += (end.getTime() - start.getTime()) / 1000 / 60 / 60; // convert to hours
            })
            return total;
        }),
});
