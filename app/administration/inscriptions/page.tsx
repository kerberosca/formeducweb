import type { Metadata } from "next";
import Link from "next/link";

import {
  manualEnrollmentAction,
  revokeEnrollmentAction
} from "@/app/administration/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Inscriptions — Administration",
  robots: { index: false, follow: false }
};

const selectClass =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm";

export default async function EnrollmentsAdminPage() {
  const [enrollments, courses] = await Promise.all([
    db.enrollment.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, slug: true } }
      }
    }),
    db.course.findMany({
      where: { status: "published", archivedAt: null },
      orderBy: { title: "asc" },
      select: { id: true, title: true }
    })
  ]);

  return (
    <>
      <p className="eyebrow">Accès</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">Inscriptions</h1>
      <Card className="mt-7">
        <CardHeader>
          <CardTitle>Inscrire manuellement une personne</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={manualEnrollmentAction}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >
            <div>
              <Label htmlFor="email">Courriel vérifié</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="courseId">Formation</Label>
              <select
                id="courseId"
                name="courseId"
                required
                className={`${selectClass} mt-2`}
              >
                <option value="">Choisir</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Accorder l’accès</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-7 overflow-x-auto rounded-2xl border border-border/70 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-4">Personne</th>
              <th className="p-4">Formation</th>
              <th className="p-4">Source</th>
              <th className="p-4">Progression</th>
              <th className="p-4">État</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className="p-4">
                  <p className="font-semibold">
                    {enrollment.user.name ?? "Sans nom"}
                  </p>
                  <p className="text-muted-foreground">
                    {enrollment.user.email}
                  </p>
                </td>
                <td className="p-4">
                  <Link
                    className="font-semibold text-primary"
                    href={`/administration/formations/${enrollment.courseId}`}
                  >
                    {enrollment.course.title}
                  </Link>
                </td>
                <td className="p-4">{enrollment.source}</td>
                <td className="p-4">{enrollment.progressPercent} %</td>
                <td className="p-4">
                  <Badge
                    variant={
                      enrollment.status === "active" && !enrollment.revokedAt
                        ? "default"
                        : "outline"
                    }
                  >
                    {enrollment.revokedAt ? "révoqué" : enrollment.status}
                  </Badge>
                </td>
                <td className="p-4">
                  {enrollment.status === "active" && !enrollment.revokedAt ? (
                    <form action={revokeEnrollmentAction}>
                      <input
                        type="hidden"
                        name="enrollmentId"
                        value={enrollment.id}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        Révoquer
                      </Button>
                    </form>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
