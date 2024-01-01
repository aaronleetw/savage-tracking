import { useState } from "react";
import { api } from "~/utils/api";

export default function UserView() {
    const [username, setUsername] = useState("");

    const periods = api.admin.getPeriods.useQuery();
    const timePeriods = api.admin.getTimePeriods.useQuery();
    const userSelectedPeriods = api.admin.getUserSelectedPeriods.useQuery(username);
    const userAttendance = api.admin.getUserAttendance.useQuery(username);
    const userData = api.admin.getUserData.useQuery(username);
    const userToggleAttendance = api.admin.userToggleAttendance.useMutation();
    const userAttendTime = api.admin.userAttendTime.useQuery(username);
    const userSelectedAllAttendTime = api.admin.userSelectedAllAttendTime.useQuery(username);
    const userActualAttendTime = api.admin.userActualAttendTime.useQuery(username);
    let periodCnt = 0;
    let attCnt = 0;
    let entered = false;
    let passedDate = false;

    return <div className="block">
        <div className="flex gap-5 items-center mb-2 flex-wrap">
            <label className="block max-w-72">
                <span className="text-gray-700">Username</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    onChange={(evt) => {
                        setUsername(evt.target.value);
                        userSelectedPeriods.refetch().catch((err) => console.log(err));
                        userAttendance.refetch().catch((err) => console.log(err));
                        userAttendTime.refetch().catch((err) => console.log(err));
                        userActualAttendTime.refetch().catch((err) => console.log(err));
                        userSelectedAllAttendTime.refetch().catch((err) => console.log(err));
                        userData.refetch().catch((err) => console.log(err));
                    }} value={username}>
                </input>
            </label>
            <label className="block max-w-32">
                <span className="text-gray-700">Grade</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 bg-gray-200"
                    disabled value={userData.data?.grade ?? ""}>
                </input>
            </label>
            <label className="block max-w-32">
                <span className="text-gray-700">Class</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 bg-gray-200"
                    disabled value={userData.data?.class ?? ""}>
                </input>
            </label>
            <label className="block max-w-32">
                <span className="text-gray-700">Number</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 bg-gray-200"
                    disabled value={userData.data?.number ?? ""}>
                </input>
            </label>
            <label className="block max-w-32">
                <span className="text-gray-700">Name</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 bg-gray-200"
                    disabled value={userData.data?.name ?? ""}>
                </input>
            </label>
            <label className="block max-w-32">
                <span className="text-gray-700">Display Name</span>
                <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 bg-gray-200"
                    disabled value={userData.data?.dname ?? ""}>
                </input>
            </label>

            {
                (userSelectedPeriods.isLoading ?? userData.isLoading) && <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-emerald-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            }
        </div>
        {userData.data === null && <div className="text-red-600">User not found.</div>}
        <hr className="my-5" />
        {userData.data !== null && userData.data !== undefined && <>
            <div className="flex gap-2 my-5">
                <div className="border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col bg-gray-300">
                    <div className="text-center text-2xl font-bold">總選取時數</div>
                    <div className="flex-grow flex items-center">
                        <div className="text-center text-6xl font-bold">{userSelectedAllAttendTime.data}</div>
                    </div>
                </div>
                <div className="border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col bg-gray-300">
                    <div className="text-center text-xl font-bold">未來選取時數</div>
                    <div className="flex-grow flex items-center">
                        <div className="text-center text-6xl font-bold">{userAttendTime.data}</div>
                    </div>
                </div>
                <div className="border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col bg-gray-300">
                    <div className="text-center text-xl font-bold">實際出席時數</div>
                    <div className="flex-grow flex items-center">
                        <div className="text-center text-6xl font-bold">{userActualAttendTime.data?.toFixed(1)}</div>
                    </div>
                </div>
                <div className={[
                    "border rounded-xl h-32 w-40 p-2 flex items-center justify-center flex-col",
                    (userActualAttendTime.data ?? 0) + (userAttendTime.data ?? 0) >= 100 ? "bg-emerald-500" : "bg-red-300"
                ].join(" ")}>
                    <div className="text-center text-xl font-bold">預估總時數</div>
                    <div className="flex-grow flex items-center">
                        <div className="text-center text-6xl font-bold">{((userActualAttendTime.data ?? 0) + (userAttendTime.data ?? 0)).toFixed(1)}</div>
                    </div>
                </div>
            </div>

            <table className="table-auto border-collapse border-2 border-black w-fit my-5">
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
                            const borderTop = new Date(date).setHours(0, 0, 0, 0) > new Date().getTime() && !passedDate;
                            if (borderTop) passedDate = true;
                            return (
                                <tr className={[
                                    "*:p-1 *:border",
                                    borderTop && "border-t-2 border-t-black"
                                 ].join(" ")} key={date}>
                                    <td>{date}</td>
                                    {
                                        timePeriods.data?.map((timePeriod) => {
                                            const thisPeriodId = periods.data![date]![periodCnt]?.id!;
                                            if (periods.data![date]![periodCnt]?.timePeriodId == timePeriod.id) {
                                                periodCnt++;
                                                if (userSelectedPeriods.data?.findIndex((period) => period == thisPeriodId) != -1) {
                                                    return <td key={timePeriod.id * periodCnt} className="bg-emerald-200 hover:cursor-pointer"
                                                        onClick={() => userToggleAttendance.mutateAsync({
                                                            username: username,
                                                            periodId: thisPeriodId ?? -1,
                                                            attendance: false
                                                        }).then(() => {
                                                            userSelectedPeriods.refetch();
                                                            userAttendTime.refetch();
                                                            userSelectedAllAttendTime.refetch();
                                                        }).catch((e) => alert(e.message))}>
                                                        Will Attend
                                                    </td>
                                                } else {
                                                    return <td key={timePeriod.id * periodCnt} className="bg-sky-100 hover:cursor-pointer"
                                                        onClick={() => userToggleAttendance.mutateAsync({
                                                            username: username,
                                                            periodId: thisPeriodId ?? -1,
                                                            attendance: true
                                                        }).then(() => {
                                                            userSelectedPeriods.refetch();
                                                            userAttendTime.refetch();
                                                            userSelectedAllAttendTime.refetch();
                                                        }).catch((e) => alert(e.message))}></td>
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
                            const borderTop = new Date(date).setHours(0, 0, 0, 0) > new Date().getTime() && !passedDate;
                            if (borderTop) passedDate = true;
                            return (
                                <tr className={[
                                    "*:p-1 *:border",
                                    borderTop && "border-t-2 border-t-black"
                                 ].join(" ")} key={date}>
                                    <td>{date}</td>
                                    {
                                        timePeriods.data?.map((timePeriod) => {
                                            periodCnt++;

                                            let data = "";
                                            const thisPeriodStart = new Date(date);
                                            thisPeriodStart.setHours(parseInt(timePeriod.start.split(":")[0]!), parseInt(timePeriod.start.split(":")[1]!), 0, 0)
                                            const thisPeriodEnd = new Date(date);
                                            thisPeriodEnd.setHours(parseInt(timePeriod.end.split(":")[0]!), parseInt(timePeriod.end.split(":")[1]!), 0, 0)

                                            for (let i = attCnt; i < (userAttendance.data ?? []).length; i++) {
                                                const thisAtt = userAttendance.data![i];
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
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </>}
    </div>
}
