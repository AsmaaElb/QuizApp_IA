import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SignInButton from "@/components/SignInButton"; // Adjust the import path if necessary
import {redirect} from "next/navigation";
import {getAuthSession} from "@/lib/nextauth";

export default async function Home() {
  const session = await getAuthSession();
  if(session?.user){
    //that mean the user is logged in
    return redirect("/dashboard");
  }
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>
            Welcome to UniversityQuiz!
          </CardTitle>
          <CardDescription>
            UniversityQuiz is a quiz app that allows you to create and share quizzes with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton text="Sign In with Google!" />
        </CardContent>
      </Card>
    </div>
  );
}
