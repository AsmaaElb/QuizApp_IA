'use client';
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { quizCreationSchema } from '@/schemas/form/quiz';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from 'antd';
import { Button } from '@/components/ui/button';
import { CopyCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BookOpen } from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import LoadingQuestions from "./LoadingQuestions";

type Props = {};

type InputType = z.infer<typeof quizCreationSchema>;

const QuizCreation = (props: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const { mutate: getQuestions } = useMutation({
        mutationFn: async ({ amount, topic, type }: InputType) => {
            const response = await axios.post("/api/game", {
                amount,
                topic,
                type,
            });
            return response.data;
        }
    });

    const form = useForm<InputType>({
        resolver: zodResolver(quizCreationSchema),
        defaultValues: { 
            amount: 3,
            topic: "",
            type: "open_ended"
        }
    });

    const onSubmit = (input: InputType) => {
        setShowLoader(true); // Show loading screen
        getQuestions(input, {
            onSuccess: ({ gameId }: { gameId: string }) => {
                setTimeout(() => {
                    setShowLoader(false); // Hide loading screen
                    if (form.getValues("type") === "mcq") {
                        router.push(`/play/mcq/${gameId}`);
                    } else if (form.getValues("type") === "open_ended") {
                        router.push(`/play/open-ended/${gameId}`);
                    }
                }, 1000); // Delay of 500ms to show the loader
            }
        });
    };

    if (showLoader) {
        return <LoadingQuestions finished={false} />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md p-6 space-y-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
                    <CardDescription>Choose a topic</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter a topic ..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Please provide a topic
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Questions</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter an amount ..." 
                                                {...field}
                                                type='number'
                                                min={1}
                                                max={10}
                                                onChange={e => form.setValue('amount', parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    onClick={() => form.setValue('type', 'mcq')}
                                    className={`w-1/2 rounded-none rounded-l-lg ${
                                        form.getValues('type') === 'mcq' ? 'btn-primary text-black' : 'btn-secondary text-white'
                                    } hover:text-black`}>
                                    <CopyCheck className="w-4 h-4 mr-2"/> Multiple Choice
                                </Button>
                                <Separator orientation="vertical" />
                                <Button
                                    type="button"
                                    onClick={() => form.setValue('type', 'open_ended')}
                                    className={`w-1/2 rounded-none rounded-r-lg ${
                                        form.getValues('type') === 'open_ended' ? 'btn-primary text-white' : 'btn-secondary text-white'
                                    } hover:text-black`}>
                                    <BookOpen className="w-4 h-4 mr-2" /> Open Ended
                                </Button>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full mt-4">
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizCreation;
