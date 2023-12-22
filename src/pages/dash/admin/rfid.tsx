import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "~/components/DashboardHeader";
import { api } from "~/utils/api";

export default function Dash() {
    const { push } = useRouter();
    const isLoggedIn = api.admin.isLoggedIn.useQuery();
    const users = api.admin.getAllUsers.useQuery();
    const lastRfid = api.admin.getLastRfid.useQuery();
    const setUserRfid = api.admin.setUserRfid.useMutation();

    useEffect(() => {
        if (isLoggedIn.failureCount > 0) {
            push("/");
        }
    }, [isLoggedIn.failureCount])

    useEffect(() => {
        if (lastRfid.isSuccess) {
            const interval = setInterval(() => {
                lastRfid.refetch();
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [])

    if (isLoggedIn.isLoading) return <></>

    return (<>
        <Head>
            <title>Savage Tracking</title>
            <meta name="description" content="Time tracking app for FRC build season personnel management." />
            <link rel="icon" href="/favicon.png" />
        </Head>
        <main className="">
            <DashboardHeader url="/dash/admin/rfid" />
            <div className="m-5">
                <table className="table-auto border-collapse border-2 border-black w-fit">
                    <thead>
                        <tr className="*:p-1 *:border border-b-2 border-b-black">
                            <th>Username</th>
                            <th>Grade</th>
                            <th>Class</th>
                            <th>Number</th>
                            <th>Name</th>
                            <th>RFID</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.data?.map((user) => (
                                <tr className="*:p-1 *:border" key={user.username}>
                                    <td>{user.username}</td>
                                    <td>{user.grade}</td>
                                    <td>{user.class}</td>
                                    <td>{user.number}</td>
                                    <td>{user.name}</td>
                                    <td>{user.rfid}</td>
                                    <td className="text-emerald-600 underline text-center hover:cursor-pointer" onClick={() => {
                                        setUserRfid.mutateAsync({
                                            username: user.username,
                                            rfid: lastRfid.data || ""
                                        }).then(() => users.refetch())
                                    }}>
                                        Select
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <h2 className="my-5 text-2xl">Last RFID: <code className="rounded bg-slate-700 text-white p-1 ml-1">{lastRfid.data}</code></h2>
            </div>
        </main>
    </>)
}