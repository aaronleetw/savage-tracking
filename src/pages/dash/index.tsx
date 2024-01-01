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
    const myAttendance = api.timeSel.getMyAttendance.useQuery();
    const toggleAttendance = api.timeSel.toggleAttendance.useMutation();
    const attendTime = api.timeSel.attendTime.useQuery();
    const actualAttendTime = api.timeSel.actualAttendTime.useQuery();

    let periodCnt = 0;
    let attCnt = 0;
    let entered = false;

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
                <div className="flex gap-2">
                    <div className="border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col mb-5 bg-gray-300">
                        <div className="text-center text-2xl font-bold">已選取時數</div>
                        <div className="flex-grow flex items-center">
                            <div className="text-center text-6xl font-bold">{attendTime.data}</div>
                        </div>
                    </div>
                    <div className="border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col mb-5 bg-gray-300">
                        <div className="text-center text-xl font-bold">實際出席時數</div>
                        <div className="flex-grow flex items-center">
                            <div className="text-center text-6xl font-bold">{actualAttendTime.data?.toFixed(1)}</div>
                        </div>
                    </div>
                    <div className={[
                            "border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col mb-5",
                            (actualAttendTime.data ?? 0) + (attendTime.data ?? 0) >= 30 ? "bg-emerald-500" : "bg-red-300"
                        ].join(" ")}>
                        <div className="text-center text-xl font-bold">預估總時數</div>
                        <div className="flex-grow flex items-center">
                            <div className="text-center text-6xl font-bold">{((actualAttendTime.data ?? 0) + (attendTime.data ?? 0)).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
                <div className="text-2xl font-bold mb-2">請點選下方切換狀態 (&gt; 100 小時會變綠燈)</div>
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
                            Object.keys(periods.data ?? {}).map((date) => {
                                periodCnt = 0;
                                entered = false;
                                return (
                                    <tr className="*:p-1 *:border" key={date}>
                                        <td>{date}</td>
                                        {
                                            new Date(date).setHours(0, 0, 0, 0) > new Date().getTime() ? (
                                                timePeriods.data?.map((timePeriod) => {
                                                    const thisPeriodId = periods.data![date]![periodCnt]?.id!;
                                                    if (periods.data![date]![periodCnt]?.timePeriodId == timePeriod.id) {
                                                        periodCnt++;
                                                        if (mySelectedPeriods.data?.findIndex((period) => period == thisPeriodId) != -1) {
                                                            return <td key={timePeriod.id * periodCnt} className="bg-emerald-200 hover:cursor-pointer"
                                                                onClick={() => toggleAttendance.mutateAsync({
                                                                    periodId: thisPeriodId ?? -1,
                                                                    attendance: false
                                                                }).then(() => mySelectedPeriods.refetch()).then(() => attendTime.refetch()).catch((e) => alert(e.message))}>
                                                                Will Attend
                                                            </td>
                                                        } else {
                                                            return <td key={timePeriod.id * periodCnt} className="bg-sky-100 hover:cursor-pointer"
                                                                onClick={() => toggleAttendance.mutateAsync({
                                                                    periodId: thisPeriodId ?? -1,
                                                                    attendance: true
                                                                }).then(() => mySelectedPeriods.refetch()).then(() => attendTime.refetch()).catch((e) => alert(e.message))}></td>
                                                        }
                                                    } else {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-gray-400">N/A</td>
                                                    }
                                                })
                                            ) : (
                                                timePeriods.data?.map((timePeriod) => {
                                                    periodCnt++;

                                                    let data = "";
                                                    const thisPeriodStart = new Date(date);
                                                    thisPeriodStart.setHours(parseInt(timePeriod.start.split(":")[0]!), parseInt(timePeriod.start.split(":")[1]!), 0, 0)
                                                    const thisPeriodEnd = new Date(date);
                                                    thisPeriodEnd.setHours(parseInt(timePeriod.end.split(":")[0]!), parseInt(timePeriod.end.split(":")[1]!), 0, 0)

                                                    for (let i = attCnt; i < (myAttendance.data ?? []).length; i++) {
                                                        const thisAtt = myAttendance.data![i];
                                                        if (thisAtt?.datetime! < thisPeriodStart) continue;
                                                        if (thisAtt?.datetime! > thisPeriodEnd) {
                                                            attCnt = i;
                                                            break;
                                                        }
                                                        if (!entered) {
                                                            data += `${data !== "" ? " / " : ""}${thisAtt?.datetime!.toLocaleTimeString()} ~ `;
                                                        } else {
                                                            data += `${thisAtt?.datetime!.toLocaleTimeString()}`;
                                                        }
                                                        entered = !entered;
                                                    }

                                                    if (entered && data === "" && periodCnt !== timePeriods.data!.length) {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-green-700 text-white"></td>
                                                    }
                                                    if (entered && periodCnt === timePeriods.data!.length) {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-yellow-700 text-white">{data}</td>
                                                    }
                                                    if (data === "") {
                                                        return <td key={timePeriod.id * periodCnt} className="bg-gray-500 text-white">Absent</td>
                                                    }
                                                    return <td key={timePeriod.id * periodCnt} className="bg-green-700 text-white">{data}</td>
                                                })
                                            )
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