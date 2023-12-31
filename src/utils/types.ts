import { z } from "zod";

export const PublicUserType = z.object({
    grade: z.number().int().nullable(),
    class: z.string().nullable(),
    name: z.string(),
    username: z.string(),
    isAdmin: z.boolean(),
    rosterOnly: z.boolean().default(false),
}).or(z.undefined());

export const LoginSchema = z.object({
    username: z.string().min(1, { message: "Username cannot be empty." }),
    password: z.string(),
})

export const ChgPasswordSchema = z.object({
    oldPassword: z.string().min(1, { message: "Old password cannot be empty." }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters long." }),
})

export const AddTimePeriodSchema = z.object({
    id: z.coerce.number().int({ message: "ID must be an integer." }).min(1, { message: "ID must be greater than 0." }).max(999, { message: "ID must be less than 1000." }),
    name: z.string().min(1, { message: "Name cannot be empty." }),
    startTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in the format HH:MM."}),
    endTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in the format HH:MM."}),
})

export const AddUserSchema = z.object({
    username: z.string().min(1, { message: "Username cannot be empty." }),
    name: z.string().min(1, { message: "Name cannot be empty." }),
    dname: z.string().min(1, { message: "Display name cannot be empty." }).regex(/^[a-z0-9_\-]+$/i, { message: "Display name must only contain letters, numbers, underscores, and dashes." }),
    grade: z.coerce.number().int().nullable(),
    class: z.string().nullable(),
    number: z.coerce.number().int().nullable(),
})

export const AddPeriods = z.object({
    date: z.string().regex(/^20[2-3][0-9]-(0?[1-9]|1[0-2]){1}-(0?[1-9]|1[0-9]|2[0-9]|3[0-1]){1}$/, { message: "Periods must be in the format YYYY/MM/DD."})
})

export const DateRange = z.object({
    start: z.string().regex(/^20[2-3][0-9]-(0?[1-9]|1[0-2]){1}-(0?[1-9]|1[0-9]|2[0-9]|3[0-1]){1}$/, { message: "Start date must be in the format YYYY/MM/DD."}),
    end: z.string().regex(/^20[2-3][0-9]-(0?[1-9]|1[0-2]){1}-(0?[1-9]|1[0-9]|2[0-9]|3[0-1]){1}$/, { message: "End date must be in the format YYYY/MM/DD."}),
})

export const AddAttendance = z.object({
    datetime: z.string().regex(/^20[2-3][0-9]-(0?[1-9]|1[0-2]){1}-(0?[1-9]|1[0-9]|2[0-9]|3[0-1]){1}T(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Datetime must be in the format YYYY/MM/DDThh:mm."}),
    username: z.string().min(1, { message: "Username cannot be empty." }),
})