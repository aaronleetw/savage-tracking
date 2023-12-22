import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import { LoginSchema } from "~/utils/types";

export default function Home() {
  const login = api.admin.login.useMutation();
  const { push } = useRouter();
  type LoginSchemaType = z.infer<typeof LoginSchema>;
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaType>({ resolver: zodResolver(LoginSchema) });
  const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => login.mutateAsync(data).catch((err) => console.log(err));
  useEffect(() => {
    if (login.isSuccess) {
      push("/dash")
    }
  }, [login.isSuccess]);

  return (
    <>
      <Head>
        <title>Savage Tracking</title>
        <meta name="description" content="Time tracking app for FRC build season personnel management." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className="">
        <div className="flex items-center w-full mb-5 text-3xl md:text-5xl font-bold bg-indigo-100 p-5">
          <img className="h-16 md:h-24 m-2" src="/favicon.png" alt="" />
          <div>
              <h1 className="mb-2">Savage Tracking</h1>
              <h2 className="text-2xl">Please Login</h2>
          </div>
        </div>
        <div className="max-w-[40rem] p-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label className="block text-md font-medium text-gray-700 mt-2">Username</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-70" {...register("username")} />
              {errors.username && <span className="text-red-500">{errors.username.message}</span>}
            </div>
            <div className="mb-7">
              <label className="block text-md font-medium text-gray-700 mt-2">Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-70" {...register("password")} />
              {errors.password && <span>{errors.password.message}</span>}
            </div>
            { login.isError && <div className="text-red-500 mb-5">{login.error.message}</div> }
            { login.isSuccess && <div className="text-green-500 mb-5">Success! Redirecting...</div> }
            <button className="bg-indigo-600 px-3 py-2 rounded text-white focus:ring focus:ring-indigo-200 focus:ring-opacity-70 disabled:bg-indigo-400 mb-5" disabled={login.isLoading}>
              Login
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
