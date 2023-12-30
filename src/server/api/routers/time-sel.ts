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
    getMyAttendance: loggedInProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.attendance.findMany({
                where: {
                    user: {
                        username: ctx.session?.username,
                    }
                },
                select: {
                    datetime: true,
                },
                orderBy: {
                    datetime: "asc",
                },
            });
        }),
    actualAttendTime: loggedInProcedure
        .query(async ({ ctx }) => {
            const attendance = await ctx.db.attendance.findMany({
                where: {
                    user: {
                        username: ctx.session?.username,
                    }
                },
                select: {
                    datetime: true,
                },
                orderBy: {
                    datetime: "asc",
                },
            });
            const dates = await ctx.db.period.findMany({
                select: {
                    date: true,
                },
                orderBy: {
                    date: "asc",
                }
            }).then((periods) => {
                const dates: string[] = [];
                periods.forEach(period => {
                    const dateStr = period.date.toLocaleDateString();
                    if (!dates.includes(dateStr)) dates.push(dateStr);
                })
                return dates;
            })
            const timePeriods = await ctx.db.timePeriod.findMany({
                select: {
                    start: true,
                    end: true,
                },
                orderBy: [
                    { start: "asc" },
                    { end: "asc" },
                ]
            });
            let attCnt = 0;
            let calculator = 0.0;
            dates.forEach((date) => {
                let periodCnt = 0;
                let entered = false;
                timePeriods.forEach((timePeriod) => {
                    periodCnt++;
                    const thisPeriodStart = new Date(date);
                    thisPeriodStart.setHours(parseInt(timePeriod.start.split(":")[0]!), parseInt(timePeriod.start.split(":")[1]!), 0, 0)
                    const thisPeriodEnd = new Date(date);
                    thisPeriodEnd.setHours(parseInt(timePeriod.end.split(":")[0]!), parseInt(timePeriod.end.split(":")[1]!), 0, 0)

                    for (let i = attCnt; i < attendance.length; i++) {
                        const thisAtt = attendance[i]!;
                        if (thisAtt.datetime < thisPeriodStart) continue;
                        if (thisAtt.datetime > thisPeriodEnd) {
                            attCnt = i;
                            break;
                        }
                        if (!entered) {
                            calculator -= thisAtt.datetime.getTime();
                        } else {
                            calculator += thisAtt.datetime.getTime();
                        }
                        entered = !entered;
                    }
                    if (entered && periodCnt === timePeriods.length) {
                        calculator += thisPeriodEnd.getTime();
                    }
                })
            })
            return calculator / 1000 / 60 / 60;
        }),
});
