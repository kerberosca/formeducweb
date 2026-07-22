import { notFound } from "next/navigation";
import { AdminShell, EventForm } from "@/components/demo839/admin";
import { requireAdmin } from "@/lib/demo839/admin-auth";
import { getAdminEvent, getCategories, getCurrentCalendarYear } from "@/lib/demo839/data";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const [event, year, categories] = await Promise.all([getAdminEvent(Number(id)), getCurrentCalendarYear(), getCategories(false)]);
  if (!event || !year) notFound();
  return <AdminShell user={user}><div className="admin-main admin-main--narrow"><header className="admin-title-row"><div><p className="eyebrow">Modifier une activité</p><h1>{event.title}</h1></div></header><section className="admin-section"><EventForm event={event} year={year} categories={categories} /></section></div></AdminShell>;
}

