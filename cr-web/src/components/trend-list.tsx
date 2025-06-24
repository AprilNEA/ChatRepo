import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import useSWR from "swr";
import { ScrollArea } from "./ui/scroll-area";
import useRepo from "@/hooks/use-repo";
interface TrendingRepo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  url: string;
  language: string;
  owner: string;
  avatarUrl: string;
}

export function TrendList() {
  const { setRepo } = useRepo();
  const { data, isLoading, error } = useSWR("/api/trend", (url) => {
    return fetch(url).then((res) => res.json() as Promise<TrendingRepo[]>);
  });

  return (
    <Dialog>
      <DialogTrigger className="w-full flex flex-col gap-2 items-center">
        <p className="text-lg font-medium">Browse Trending Repositories</p>
        <p className="text-sm text-muted-foreground">
          Discover the most popular open source projects on GitHub
        </p>
        <Button
          variant="outline"
          className="hover:bg-accent/50 transition-colors text-xs text-primary max-w-32"
        >
          Click to explore →
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Trending Repositories</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <div className="grid gap-4 pr-4 max-h-[400px]">
            {data ? (
              data.map((repo) => (
                <Card
                  key={repo.fullName}
                  className="hover:bg-accent/50"
                  onClick={() => setRepo(repo.fullName)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={repo.avatarUrl} alt={repo.owner} />
                        <AvatarFallback>{repo.owner}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {repo.fullName}
                            </a>
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4" />
                            <span>{repo.stars.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {repo.description}
                        </p>
                        {repo.language && (
                          <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center">
                {isLoading ? "Loading..." : "Error loading data"}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
