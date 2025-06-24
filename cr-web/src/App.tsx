import "@/index.css";

import { useChat } from "@ai-sdk/react";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
	CardTitle,
} from "./components/ui/card";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import {
	ChatBubble,
	ChatBubbleMessage,
	ChatBubbleAvatar,
} from "@/components/ui/chat/chat-bubble";
import { TrendList } from "@/components/trend-list";
import useRepo from "@/hooks/use-repo";
import useSWR from "swr";
import SettingsPanel from "./components/settings";
import { CogIcon } from "lucide-react";
import { useHC } from "./lib/hono-swr";
import apiClient from "./lib/api-client";

interface Message {
	id: string;
	role: "user" | "assistant" | "data" | "system";
	content: string;
}

function ChatUI({ repoContent }: { repoContent: string }) {
	const { messages, input, handleInputChange, handleSubmit, status } = useChat({
		api: "/api/chat",
		initialMessages: [
			{
				id: "1",
				role: "assistant",
				content: repoContent,
			},
		],
	});

	return (
		<>
			<CardContent className="p-0">
				<div className="h-[60vh] overflow-hidden">
					<ChatMessageList>
						{messages.slice(1).map((message: Message) => (
							<ChatBubble
								key={message.id}
								variant={message.role === "user" ? "sent" : "received"}
							>
								<ChatBubbleAvatar
									src={
										message.role === "user"
											? "/user-avatar.png"
											: "/ai-avatar.png"
									}
									fallback={message.role === "user" ? "U" : "AI"}
								/>
								<ChatBubbleMessage
									variant={message.role === "user" ? "sent" : "received"}
								>
									{message.content}
								</ChatBubbleMessage>
							</ChatBubble>
						))}
						{status === "submitted" && (
							<ChatBubble variant="received">
								<ChatBubbleAvatar src="/ai-avatar.png" fallback="AI" />
								<ChatBubbleMessage variant="received" isLoading>
									Thinking...
								</ChatBubbleMessage>
							</ChatBubble>
						)}
					</ChatMessageList>
				</div>
			</CardContent>
			<CardFooter className="border-t p-4">
				<form onSubmit={handleSubmit} className="flex w-full gap-2">
					<ChatInput
						value={input}
						onChange={handleInputChange}
						placeholder="Type your message..."
						className="flex-1"
					/>
					<button
						type="submit"
						disabled={status === "submitted" || !input.trim()}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</form>
			</CardFooter>
		</>
	);
}

export default function App() {
	const { repo, setRepo } = useRepo();

	const { data } = useHC(apiClient.repo.list.$get, {});

	return (
		<main className="flex max-h-screen flex-col items-center justify-center p-4 sm:p-8">
			<Card className="w-full max-w-4xl">
				<CardHeader className="border-b">
					<CardTitle className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold">
							Chat with the most popular GitHub repository of the moment
						</h2>
						<SettingsPanel />
					</CardTitle>
					{repo && (
						<div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-4">
							<div className="flex-shrink-0">
								<img
									src={`https://github.com/${repo.split("/")[0]}.png`}
									alt={repo}
									className="w-12 h-12 rounded-full"
								/>
							</div>
							<div>
								<h3 className="font-medium">{repo}</h3>
								<button
									type="button"
									onClick={() => setRepo(null)}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Change repository
								</button>
							</div>
						</div>
					)}
				</CardHeader>
				{repo ? (
					data ? (
						<ChatUI repoContent={data} />
					) : (
						<p>Loading...</p>
					)
				) : (
					<TrendList />
				)}
			</Card>
		</main>
	);
}
