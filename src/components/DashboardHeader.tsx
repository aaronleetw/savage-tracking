import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/utils/api";

export default function DashboardHeader({ url }: { url: string }) {
    const { push } = useRouter();
    const session = api.admin.session.useQuery();
    const logout = api.admin.logout.useMutation();

    useEffect(() => {
        if (logout.isSuccess) {
            push("/");
        }
    }, [logout.isSuccess])

    useEffect(() => {
        if (session.data?.rosterOnly && !url.startsWith("/dash/admin/roster"))
            push("/dash/admin/roster");
    }, [session.data])

    return (
        <div className="text-3xl md:text-5xl font-bold bg-indigo-100">
            <div className="p-5 pb-0">
                <div className="flex items-center w-full mb-3">
                    <img className="h-16 md:h-24 m-2" src="/favicon.png" alt="" />
                    <div>
                        <h1 className="mb-2">Savage Tracking</h1>
                        <h2 className="text-2xl">Hi, {session?.data?.name} ({session?.data?.grade} {session?.data?.class})</h2>
                    </div>
                    <button className="text-2xl ml-10 bg-indigo-600 px-3 py-2 rounded text-white focus:ring focus:ring-indigo-200 focus:ring-opacity-70 disabled:bg-indigo-400" disabled={logout.isLoading} onClick={() => logout.mutate()}>
                        Logout
                    </button>
                </div>
                <div className="flex items-center w-full gap-3">
                    {
                        !session?.data?.rosterOnly && (<>
                            <Link href="/dash">
                                <button className={[
                                    "text-sm md:text-xl px-3 py-2 rounded-lg rounded-b-none focus:ring focus:ring-sky-200 focus:ring-opacity-70",
                                    url == "/dash" ? "bg-sky-600 text-white" : "bg-sky-300 text-black"
                                ].join(" ")}>
                                    Attendance
                                </button>
                            </Link>
                            <Link href="/dash/chgPassword">
                                <button className={[
                                    "text-sm md:text-xl px-3 py-2 rounded-lg rounded-b-none focus:ring focus:ring-sky-200 focus:ring-opacity-70",
                                    url == "/dash/chgPassword" ? "bg-sky-600 text-white" : "bg-sky-300 text-black"
                                ].join(" ")}>
                                    Change Password
                                </button>
                            </Link>
                        </>)
                    }
                    {
                        session?.data?.isAdmin && (
                            <>
                                <Link href="/dash/admin/roster">
                                    <button className={[
                                        "text-sm md:text-xl px-3 py-2 rounded-lg rounded-b-none focus:ring focus:ring-emerald-200 focus:ring-opacity-70",
                                        url == "/dash/admin/roster" ? "bg-emerald-600 text-white" : "bg-emerald-200 text-black"
                                    ].join(" ")}>
                                        Roster
                                    </button>
                                </Link>
                                {
                                    !session?.data?.rosterOnly && (<>
                                        <Link href="/dash/admin">
                                            <button className={[
                                                "text-sm md:text-xl px-3 py-2 rounded-lg rounded-b-none focus:ring focus:ring-emerald-200 focus:ring-opacity-70",
                                                url == "/dash/admin" ? "bg-emerald-600 text-white" : "bg-emerald-200 text-black"
                                            ].join(" ")}>
                                                Settings
                                            </button>
                                        </Link>
                                        <Link href="/dash/admin/rfid">
                                            <button className={[
                                                "text-sm md:text-xl px-3 py-2 rounded-lg rounded-b-none focus:ring focus:ring-emerald-200 focus:ring-opacity-70",
                                                url == "/dash/admin/rfid" ? "bg-emerald-600 text-white" : "bg-emerald-200 text-black"
                                            ].join(" ")}>
                                                RFID
                                            </button>
                                        </Link>
                                    </>)
                                }
                            </>
                        )
                    }
                </div>
            </div>
            <div className={[
                "w-full h-2",
                url.startsWith("/dash/admin") ? "bg-emerald-600" : "bg-sky-600"
            ].join(" ")}></div>
        </div>)
}