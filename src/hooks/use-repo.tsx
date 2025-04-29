import { useQueryState } from "nuqs";

export default function useRepo() {
  const [repo, setRepo] = useQueryState("repo");

  return {
    repo,
    setRepo,
  };
}