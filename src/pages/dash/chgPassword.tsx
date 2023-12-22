import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import DashboardHeader from "~/components/DashboardHeader";
import { api } from "~/utils/api";
import { ChgPasswordSchema } from "~/utils/types";

export default function Dash() {
    const { push } = useRouter();
    const isLoggedIn = api.admin.isLoggedIn.useQuery();
    const chgPassword = api.admin.chgPassword.useMutation();
    const logout = api.admin.logout.useMutation();
    type ChgPasswordSchemaType = z.infer<typeof ChgPasswordSchema>;
    const { register, handleSubmit, formState: { errors } } = useForm<ChgPasswordSchemaType>({ resolver: zodResolver(ChgPasswordSchema) });
    const onSubmit: SubmitHandler<ChgPasswordSchemaType> = async (data) => chgPassword.mutateAsync(data).catch((err) => console.log(err));
  
    useEffect(() => {
        if (isLoggedIn.failureCount > 1) {
            push("/");
        }
    }, [isLoggedIn.failureCount])

    if (isLoggedIn.isLoading) return <></>

    useEffect(() => {
        if (chgPassword.isSuccess) {
            logout.mutateAsync().then(() => push("/"));
        }
    }, [chgPassword.isSuccess])

    return (<>
        <Head>
            <title>Savage Tracking</title>
            <meta name="description" content="Time tracking app for FRC build season personnel management." />
            <link rel="icon" href="/favicon.png" />
        </Head>
        <main className="">
            <DashboardHeader url="/dash/chgPassword" />
            <div className="max-w-[40rem] p-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-5">
                        <label className="block text-md font-medium text-gray-700 mt-2">Old Password</label>
                        <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-70" {...register("oldPassword")} />
                        {errors.oldPassword && <span className="text-red-500">{errors.oldPassword.message}</span>}
                    </div>
                    <div className="mb-7">
                        <label className="block text-md font-medium text-gray-700 mt-2">New Password</label>
                        <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-70" {...register("newPassword")} />
                        {errors.newPassword && <span>{errors.newPassword.message}</span>}
                    </div>
                    {chgPassword.isError && <div className="text-red-500 mb-5">{chgPassword.error.message}</div>}
                    {chgPassword.isSuccess && <div className="text-green-500 mb-5">Success! Please sign in again...</div>}
                    <button className="bg-sky-600 px-3 py-2 rounded text-white focus:ring focus:ring-sky-200 focus:ring-opacity-70 disabled:bg-sky-400 mb-5" disabled={chgPassword.isLoading}>
                        Login
                    </button>
                </form>
            </div>
        </main>
    </>)
}