import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "~/components/DashboardHeader";
import Config from "~/components/admin/Config";
import Periods from "~/components/admin/Periods";
import Users from "~/components/admin/Users";
import { api } from "~/utils/api";

export default function Dash() {
    const { push } = useRouter();
    const isLoggedIn = api.admin.isLoggedIn.useQuery();

    const [currentPage, setCurrentPage] = useState("config");

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
            <DashboardHeader url="/dash/admin" />
            <div className="p-5 flex flex-col md:flex-row gap-5">
                <nav className="flex flex-grow h-fit md:flex-col w-auto md:max-w-48 border border-emerald-700 rounded-lg">
                    <button className={[
                        "p-1 px-2 text-lg font-bold border-r md:border-b rounded-l-lg md:rounded-none md:rounded-t-lg transition-colors",
                        currentPage === "config" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("config")}>Configuration</button>
                    <button className={[
                        "p-1 px-2 text-lg font-bold border-r md:border-b transition-colors",
                        currentPage === "periods" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("periods")}>All Periods</button>
                    <button className={[
                        "p-1 px-2 text-lg font-bold rounded-r-lg md:rounded-none md:rounded-b-lg transition-colors",
                        currentPage === "users" ? "bg-emerald-600 border-none text-white" : "bg-white text-emerald-700"
                    ].join(" ")} onClick={() => setCurrentPage("users")}>Users</button>
                </nav>
                { currentPage === "config" && <Config /> }
                { currentPage === "users" && <Users /> }
                { currentPage === "periods" && <Periods /> }
            </div>
        </main>
    </>)
}