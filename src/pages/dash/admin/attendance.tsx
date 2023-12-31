import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "~/components/DashboardHeader";
import ListView from "~/components/admin/attendance/ListView";
import UserList from "~/components/admin/attendance/UserList";
import UserView from "~/components/admin/attendance/UserView";
import { api } from "~/utils/api";

export default function Dash() {
    const { push } = useRouter();
    const isLoggedIn = api.admin.isLoggedIn.useQuery();

    const [currentPage, setCurrentPage] = useState("list");

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
            <DashboardHeader url="/dash/admin/attendance" />
            <div className="p-5 flex flex-col md:flex-row gap-5">
                <nav className="flex flex-grow h-fit md:flex-col w-fit md:w-auto md:max-w-48 border border-emerald-700 rounded-lg">
                    <button className={[
                        "p-1 px-2 text-lg font-bold border-r md:border-b rounded-l-lg md:rounded-none md:rounded-t-lg transition-colors",
                        currentPage === "list" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("list")}>List View</button>
                    <button className={[
                        "p-1 px-2 text-lg font-bold border-r md:border-b transition-colors",
                        currentPage === "user" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("user")}>User View</button>
                    <button className={[
                        "p-1 px-2 text-lg font-bold border-r md:border-b rounded-r-lg md:rounded-none md:rounded-b-lg transition-colors",
                        currentPage === "userlist" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("userlist")}>Users List</button>
                </nav>
                { currentPage === "list" && <ListView /> }
                { currentPage === "user" && <UserView /> }
                { currentPage === "userlist" && <UserList /> }
            </div>
        </main>
    </>)
}