"use client";
import { Game, Question } from "@prisma/client";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { differenceInSeconds } from "date-fns";
import Link from "next/link";
import { BarChart, ChevronRight, Timer } from "lucide-react";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import { cn, formatTimeDelta } from "@/lib/utils";
import MCQCounter from "./MCQCounter";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { saveAs } from 'file-saver';

type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [hasEnded, setHasEnded] = React.useState(false);
  const [stats, setStats] = React.useState({
    correct_answers: 0,
    wrong_answers: 0,
  });
  const [selectedChoice, setSelectedChoice] = React.useState<number>(-1);
  const [now, setNow] = React.useState(new Date());
  const [answeredQuestions, setAnsweredQuestions] = React.useState<{
    question: string;
    options: string[];
    answer: string;
    isCorrect: boolean;
  }[]>([]);
  const [allQuestions, setAllQuestions] = React.useState<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }[]>([]);
  const [delimiter, setDelimiter] = React.useState<'A' | '1' | '-' | 'letter' | 'number' | 'dash'>('A');

  const currentQuestion = React.useMemo(() => {
    if (allQuestions && allQuestions.length > 0) {
      return allQuestions[questionIndex];
    }
    console.log("No current question found.");
    return null;
  }, [questionIndex, allQuestions]);

  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    return currentQuestion.options;
  }, [currentQuestion]);

  const { toast } = useToast();

  const { mutate: checkAnswer } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion!.id,
        userInput: options[selectedChoice],
      };
      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
      };
      const response = await axios.post(`/api/endGame`, payload);
      return response.data;
    },
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasEnded]);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/questionsWithAnswers?gameId=${game.id}`);
        setAllQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [game.id]);

  const handleNext = React.useCallback(() => {
    if (!currentQuestion || selectedChoice === -1) {
      toast({
        title: "Error",
        description: "No question or option selected",
        variant: "destructive",
      });
      return;
    }

    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        if (isCorrect) {
          setStats((stats) => ({
            ...stats,
            correct_answers: stats.correct_answers + 1,
          }));
          toast({
            title: "Correct",
            description: "You got it right!",
            variant: "success",
          });

          setAnsweredQuestions((prev) => [
            ...prev,
            {
              question: currentQuestion.question,
              options: options,
              answer: options[selectedChoice],
              isCorrect,
            },
          ]);
        } else {
          setStats((stats) => ({
            ...stats,
            wrong_answers: stats.wrong_answers + 1,
          }));
          toast({
            title: "Incorrect",
            description: "You got it wrong!",
            variant: "destructive",
          });
        }

        if (questionIndex === allQuestions.length - 1) {
          endGame();
          setHasEnded(true);
          return;
        }
        setQuestionIndex((prevIndex) => prevIndex + 1);
      },
    });
  }, [checkAnswer, currentQuestion, options, questionIndex, allQuestions.length, toast, endGame, selectedChoice]);

  // Generate XML
  const generateXML = () => {
    const xmlQuestions = allQuestions
      .map((questionData) => {
        const questionText = questionData.question;
        const options = questionData.options;
        const correctAnswer = questionData.correctAnswer;
        const correctAnswerIndex = options.findIndex(opt => opt === correctAnswer) + 1;

        return `
          <question>
            <text>${questionText}</text>
            <options>
              ${options.map((opt, index) => 
                `<option${index + 1 === correctAnswerIndex ? ' correct="true"' : ''}>${index + 1}. ${opt}</option>`).join("\n")}
            </options>
            ${correctAnswerIndex > 0 ? `<correctAnswer>${correctAnswerIndex}. ${correctAnswer}</correctAnswer>` : ''}
          </question>`;
      }).join("\n");

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <quiz>
      ${xmlQuestions}
    </quiz>`;

    const blob = new Blob([xmlContent], { type: "application/xml" });
    saveAs(blob, "questions.xml");
  };

  // Generate Aiken
  const generateAiken = () => {
    const aikenQuestions = allQuestions
      .map((questionData) => {
        const questionText = questionData.question;
        const options = questionData.options;
        const correctAnswer = questionData.correctAnswer;
        const correctAnswerIndex = options.findIndex(opt => opt === correctAnswer);
        const correctAnswerLetter = correctAnswerIndex >= 0
          ? String.fromCharCode(65 + correctAnswerIndex)
          : '';

        return `
${questionText}
${options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n')}
ANSWER: ${correctAnswerLetter}`;
      }).join("\n\n");

    const aikenContent = aikenQuestions;

    const blob = new Blob([aikenContent], { type: "text/plain" });
    saveAs(blob, "questions.aiken");
  };

  if (!currentQuestion) {
    return (
      <div className="text-center text-red-500">
        Loading questions... Please check if game data is properly loaded.
      </div>
    );
  }

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in{" "}
          {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
        <Button className="mt-4" onClick={generateXML}>
          Generate XML
        </Button>
        <div className="mt-4">
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as 'A' | '1' | '-' | 'letter' | 'number' | 'dash')}
            className="p-2 border rounded"
          >
            <option value="A">Letter (A, B, C, etc.)</option>
            <option value="1">Number (1, 2, 3, etc.)</option>
            <option value="-">Dash (-)</option>
            <option value="letter">Letter</option>
            <option value="number">Number</option>
            <option value="dash">Dash</option>
          </select>
          <Button className="mt-2" onClick={generateAiken}>
            Generate Aiken
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p>
            <span className="text-slate-400">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
        <MCQCounter
          correctAnswers={stats.correct_answers}
          wrongAnswers={stats.wrong_answers}
        />
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between">
            <span>Question {questionIndex + 1}</span>
          </CardTitle>
          <CardDescription className="text-lg text-slate-800">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid items-start grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
        {options.map((option, index) => (
          <button
            key={index}
            className={cn(
              "rounded-md border p-3 text-left transition-all",
              selectedChoice === index
                ? "border-green-500 bg-green-100"
                : "border-slate-300"
            )}
            onClick={() => setSelectedChoice(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <Button
        className="w-full mt-4"
        disabled={selectedChoice === -1}
        onClick={handleNext}
      >
        Next Question
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default MCQ;
