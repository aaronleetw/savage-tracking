import { z } from "zod";

export const PublicUserType = z.object({
    grade: z.number().int().nullable(),
    class: z.string().nullable(),
    name: z.string(),
    username: z.string(),
    isAdmin: z.boolean(),
}).or(z.undefined());

export const LoginSchema = z.object({
    username: z.string().min(1, { message: "Username cannot be empty." }),
    password: z.string(),
})