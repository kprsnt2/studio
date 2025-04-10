'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateDebateArguments} from '@/ai/flows/generate-debate-arguments';
import {analyzeArgumentWeaknesses} from '@/ai/flows/analyze-argument-weaknesses';
import {ScrollArea} from '@/components/ui/scroll-area';
import {toast} from "@/hooks/use-toast"
import {Toaster} from "@/components/ui/toaster"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

export default function Home() {
  const [topic, setTopic] = useState('');
  const [proArguments, setProArguments] = useState<string[]>([]);
  const [conArguments, setConArguments] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleTopicSubmit = async () => {
    if (!topic) {
      toast({
        title: "Missing topic!",
        description: "Please enter a debate topic.",
      })
      return;
    }

    // Generate pro arguments
    const proResult = await generateDebateArguments({topic: topic, stance: 'pro'});
    if (proResult && proResult.arguments) {
      setProArguments(proResult.arguments);
      proResult.arguments.forEach((arg) => {
        addChatMessage({text: arg, sender: 'Pro AI'});
      });
    }

    // Generate con arguments
    const conResult = await generateDebateArguments({topic: topic, stance: 'con'});
    if (conResult && conResult.arguments) {
      setConArguments(conResult.arguments);
      conResult.arguments.forEach((arg) => {
        addChatMessage({text: arg, sender: 'Con AI'});
      });
    }
  };

  const handleAnalyzeArgument = async (argument: string, side: 'pro' | 'con') => {
    const analysisResult = await analyzeArgumentWeaknesses({topic: topic, argument: argument, side: side});

    if (analysisResult) {
      const weaknesses = analysisResult.weaknesses.join(', ');
      const rebuttals = analysisResult.rebuttals.join(', ');

      addChatMessage({
        text: `Weaknesses: ${weaknesses}\nRebuttals: ${rebuttals}`,
        sender: 'AI Analyst',
      });
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Debate Duel</h1>

      {/* Topic Submission Form */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Enter debate topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button onClick={handleTopicSubmit} className="mt-2 bg-primary text-white">
          Start Debate
        </Button>
      </div>

      {/* Debate Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pro Arguments */}
        <Card>
          <CardHeader>
            <CardTitle>Pro Arguments</CardTitle>
            <CardDescription>Arguments in favor of the topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              {proArguments.map((argument, index) => (
                <div key={index} className="argument new-argument">
                  {argument}
                  <Button
                    onClick={() => handleAnalyzeArgument(argument, 'con')}
                    className="mt-2 bg-accent text-white"
                  >
                    Analyze Weaknesses
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Con Arguments */}
        <Card>
          <CardHeader>
            <CardTitle>Con Arguments</CardTitle>
            <CardDescription>Arguments against the topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              {conArguments.map((argument, index) => (
                <div key={index} className="argument new-argument">
                  {argument}
                  <Button
                    onClick={() => handleAnalyzeArgument(argument, 'pro')}
                    className="mt-2 bg-accent text-white"
                  >
                    Analyze Weaknesses
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="mt-8">
        <Accordion type="single" collapsible>
          <AccordionItem value="chat">
            <AccordionTrigger>Chat</AccordionTrigger>
            <AccordionContent>
              <div className="border rounded-lg p-4 h-[400px] overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-semibold">{message.sender}:</span> {message.text}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

interface ChatMessage {
  text: string;
  sender: string;
}
