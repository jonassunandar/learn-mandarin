import { notFound } from "next/navigation";
import { lessons } from "@/lib/bopomofo/course";
import { Lesson } from "@/components/bopomofo/Lesson";
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) notFound();
  return <Lesson key={id} lesson={lesson} />;
}
