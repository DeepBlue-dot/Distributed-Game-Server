import { redirect } from "next/navigation";

export default function MatchmakingPage() {
  redirect("/dashboard?queue=1");
}
