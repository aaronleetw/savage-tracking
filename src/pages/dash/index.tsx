import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardHeader from "~/components/DashboardHeader";
import { api } from "~/utils/api";

export default function Dash() {
    const { push } = useRouter();
    const isLoggedIn = api.admin.isLoggedIn.useQuery();
    const periods = api.admin.getPeriods.useQuery();
    const timePeriods = api.admin.getTimePeriods.useQuery();
    const mySelectedPeriods = api.timeSel.getMySelectedPeriods.useQuery();
    const toggleAttendance = api.timeSel.toggleAttendance.useMutation();
    const attendTime = api.timeSel.attendTime.useQuery();
    let periodCnt = 0;

    useEffect(() => {
        if (isLoggedIn.failureCount > 0) {
            push("/");
        }
    }, [isLoggedIn.failureCount])

    if (isLoggedIn.isLoading) return <></>

    return (<>
        <Head>
            <title>Savage Tracking</title>
            <meta name="description" content="Time tracking app for FRC build season personnel management." />
            <link rel="icon" href="/favicon.png" />
        </Head>
        <main className="">
            <DashboardHeader url="/dash" />
            <div className="p-5">
                <div className={[
                        "border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col mb-5",
                        (attendTime.data || 0) >= 30 ? "bg-emerald-500" : "bg-red-300"
                    ].join(" ")}>
                    <div className="text-center text-3xl font-bold">Hours</div>
                    <div className="flex-grow flex items-center">
                        <div className="text-center text-6xl font-bold">{attendTime.data}</div>
                    </div>
                </div>
                <div className="text-2xl font-bold mb-2">Click cells below to toggle</div>
                <table className="table-auto border-collapse border-2 border-black w-fit mb-5">
                    <thead>
                        <tr className="*:p-1 *:border border-b-2 border-b-black">
                            <th>Date</th>
                            {
                                timePeriods.data?.map((timePeriods) => {
                                    return (<th key={timePeriods.id}>{timePeriods.name} ({timePeriods.start} ~ {timePeriods.end})</th>)
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(periods.data || {}).map((date) => {
                                periodCnt = 0;
                                return (
                                    <tr className="*:p-1 *:border" key={date}>
                                        <td>{date}</td>
                                        {
                                            timePeriods.data?.map((timePeriod) => {
                                                const thisPeriodId = periods.data![date]![periodCnt]?.id!;
                                                if (periods.data![date]![periodCnt]?.timePeriodId == timePeriod.id) {
                                                    periodCnt++;
                                                    if (mySelectedPeriods.data?.findIndex((period) => period == thisPeriodId) != -1) {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-emerald-200 hover:cursor-pointer"
                                                            onClick={() => toggleAttendance.mutateAsync({
                                                                periodId: thisPeriodId || -1,
                                                                attendance: false
                                                            }).then(() => mySelectedPeriods.refetch()).then(() => attendTime.refetch())}>
                                                            Will Attend
                                                        </td>
                                                    } else {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-sky-100 hover:cursor-pointer"
                                                            onClick={() => toggleAttendance.mutateAsync({
                                                                periodId: thisPeriodId || -1,
                                                                attendance: true
                                                            }).then(() => mySelectedPeriods.refetch()).then(() => attendTime.refetch())}></td>
                                                    }
                                                } else {
                                                    return <td key={timePeriod.id * periodCnt} className="bg-gray-400">N/A</td>
                                                }
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </main>
    </>)
}