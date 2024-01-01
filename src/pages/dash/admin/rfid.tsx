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
    const rfidAttendance = api.admin.getRfidAttendanceForDash.useQuery();
    const toggleRfidAttendance = api.admin.toggleRfidAttendanceForDash.useMutation();

    useEffect(() => {
        if (isLoggedIn.failureCount > 0) {
            push("/");
        }
    }, [isLoggedIn.failureCount])

    useEffect(() => {
        if (lastRfid.isSuccess) {
            setInterval(() => {
                lastRfid.refetch();
            }, 2000);
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
                RFID Attendance: {rfidAttendance.data?.rfidAttendance ? "Enabled" : "Disabled"}
                <button className={[
                    "p-1 px-2 text-lg font-bold rounded mb-2 ml-2 text-white transition-colors",
                    rfidAttendance.data?.rfidAttendance ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                ].join(" ")} onClick={() => toggleRfidAttendance.mutateAsync()
                    .then(() => rfidAttendance.refetch())
                    .catch((err) => console.log(err))}>
                    {rfidAttendance.data?.rfidAttendance ? "Disable" : "Enable"}
                </button>
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
                                        if (lastRfid.data === "") return;
                                        setUserRfid.mutateAsync({
                                            username: user.username,
                                            rfid: lastRfid.data ?? ""
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