import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";
import DashboardHeader from "~/components/DashboardHeader";
import { api } from "~/utils/api";

export default function Dash() {
    const { push } = useRouter();
    const [date, setDate] = useState(new Date());
    const [genDate, setGenDate] = useState(new Date(0));

    const { toPDF, targetRef: pdfRef } = usePDF({ filename: `入校名單_${date.toLocaleDateString().replace("/", "-")}.pdf` });

    const isLoggedIn = api.admin.isLoggedIn.useQuery();
    const periods = api.admin.getPeriods.useQuery();
    const timePeriods = api.admin.getTimePeriods.useQuery();
    const roster = api.admin.getRoster.useQuery({
        date: date
    });

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
            <DashboardHeader url="/dash/admin/roster" />
            <div className="m-5">
                <div className="flex gap-5 items-end">
                    <label className="block max-w-72 mb-5">
                        <span className="text-gray-700">Date</span>
                        <select className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                            onChange={(evt) => {
                                setDate(new Date(evt.target.value));
                                roster.refetch().then(() => {
                                    setGenDate(new Date());
                                });
                            }}>
                            <option value="">Select a date</option>
                            {
                                Object.keys(periods.data ?? {}).map((date) => {
                                    return (<option key={date}>{date}</option>)
                                })
                            }
                        </select>
                    </label>
                    <button className="h-fit bg-emerald-600 px-3 py-2 rounded text-white focus:ring focus:ring-emerald-200 focus:ring-opacity-70 disabled:bg-emerald-400 mb-5" disabled={roster.isLoading}
                        onClick={() => {
                            toPDF();
                        }}>
                        Download PDF
                    </button>
                    {
                        (roster.isLoading) && <div role="status">
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-emerald-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    }
                </div>
                <hr />
                <div className="pdf my-5 w-fit p-5" ref={pdfRef}>
                    <h1 className="text-3xl font-extrabold font-kai mb-2">機器人研究社 Build Season 入校名單</h1>
                    <div className="flex mb-2 justify-between font-extrabold font-kai items-end">
                        <h2 className="text-2xl font-kai">日期: {date.toLocaleDateString()}</h2>
                        <h3 className="m-0">列印時間: {genDate.toLocaleString()}</h3>
                    </div>
                    <table className="table-auto border-collapse border-2 border-black w-fit mt-3 font-kai text-lg">
                        <thead>
                            <tr className="*:p-1 *:border border-b-2 border-b-black">
                                <th>年級</th>
                                <th>班級</th>
                                <th>座號</th>
                                <th>姓名</th>
                                {
                                    timePeriods.data?.map((timePeriods) => {
                                        return (<th key={timePeriods.id}>{timePeriods.name} ({timePeriods.start} ~ {timePeriods.end})</th>)
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                roster.data?.map((user) => {
                                    return (<tr key={user.id} className="*:p-1 *:border">
                                        <td>{user.grade}</td>
                                        <td>{user.class}</td>
                                        <td>{user.number}</td>
                                        <td>{user.name}</td>
                                        {
                                            timePeriods.data?.map((timePeriod) => {
                                                if (user.periods.find((period) => period.timePeriod.id === timePeriod.id)) {
                                                    return (<td key={timePeriod.id}>✔</td>)
                                                } else {
                                                    return (<td key={timePeriod.id}></td>)
                                                }
                                            })
                                        }
                                    </tr>)
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </>)
}