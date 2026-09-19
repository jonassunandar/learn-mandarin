import { notFound } from "next/navigation";
import { vocabulary } from "@/lib/vocabulary/data";
import { WordDetail } from "@/components/vocabulary/WordDetail";
export function generateStaticParams() {
  return vocabulary.map((w) => ({ id: w.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const word = vocabulary.find((w) => w.id === id);
  if (!word) notFound();
  return <WordDetail word={word} />;
}
