import React from "react";
import { getAuthSession} from "@/lib/nextauth";
import {redirect} from "next/navigation";
import QuizMeCard from "@/components/dashboard/QuizMeCard"; 
import HistoryCard from "@/components/dashboard/HistoryCard";
import TopicsCard from "@/components/dashboard/TopicsCard";
import RecentActivities from "@/components/dashboard/RecentActivities";

 type Props = {};

 export const metadata = {
    title: "Dashboard | Quizzmify",
 };
const Dashboard = async(props: Props) => {
    const session = await getAuthSession();
    if(!session?.user){
        return redirect("/");
    }
    return <main className="p-8 mx-auto max-w-7x1">
        <div className="flex items-center">
            <h2 className="mr-2 text-3x1 font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
            <QuizMeCard/>
            <HistoryCard/>
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
            <TopicsCard />  
            <RecentActivities/>
            </div>
    </main>

};

export default Dashboard;