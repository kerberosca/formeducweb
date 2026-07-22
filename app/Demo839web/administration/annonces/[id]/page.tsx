import { notFound } from "next/navigation";
import { AdminShell, AnnouncementForm } from "@/components/demo839/admin";
import { requireAdmin } from "@/lib/demo839/admin-auth";
import { getAdminAnnouncement } from "@/lib/demo839/data";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const announcement = await getAdminAnnouncement(Number(id));
  if (!announcement) notFound();
  return <AdminShell user={user}><div className="admin-main admin-main--narrow"><header className="admin-title-row"><div><p className="eyebrow">Modifier une annonce</p><h1>{announcement.title}</h1></div></header><section className="admin-section"><AnnouncementForm announcement={announcement} /></section></div></AdminShell>;
}

