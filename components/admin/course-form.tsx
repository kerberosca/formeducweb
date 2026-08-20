import type { Course } from "@prisma/client";

import { saveCourseAction } from "@/app/administration/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_FORMATS, COURSE_LEVELS } from "@/lib/lms/constants";

const selectClass =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm";

export function CourseForm({ course }: { course?: Course }) {
  const outcomes = Array.isArray(course?.outcomes)
    ? course.outcomes
        .filter((value): value is string => typeof value === "string")
        .join("\n")
    : "";
  const prerequisites = Array.isArray(course?.prerequisites)
    ? course.prerequisites
        .filter((value): value is string => typeof value === "string")
        .join("\n")
    : "";
  return (
    <form action={saveCourseAction} className="grid gap-5 md:grid-cols-2">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <div>
        <Label htmlFor="slug">Adresse courte</Label>
        <Input
          id="slug"
          name="slug"
          required
          maxLength={120}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={course?.slug}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="shortTitle">Titre court</Label>
        <Input
          id="shortTitle"
          name="shortTitle"
          required
          maxLength={100}
          defaultValue={course?.shortTitle}
          className="mt-2"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={180}
          defaultValue={course?.title}
          className="mt-2"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          maxLength={2000}
          defaultValue={course?.description}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="theme">Thème</Label>
        <Input
          id="theme"
          name="theme"
          required
          maxLength={60}
          defaultValue={course?.theme ?? "internet"}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="level">Niveau</Label>
        <select
          id="level"
          name="level"
          className={`${selectClass} mt-2`}
          defaultValue={course?.level ?? "beginner"}
        >
          {COURSE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="offer">Offre</Label>
        <select
          id="offer"
          name="offer"
          className={`${selectClass} mt-2`}
          defaultValue={course?.offer ?? "free"}
        >
          <option value="free">Gratuite</option>
          <option value="paid">Payante</option>
          <option value="custom">Sur mesure</option>
        </select>
      </div>
      <div>
        <Label htmlFor="priceCents">Prix en cents</Label>
        <Input
          id="priceCents"
          name="priceCents"
          type="number"
          min={0}
          max={10000000}
          defaultValue={course?.priceCents ?? 0}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="durationMinutes">Durée (minutes)</Label>
        <Input
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          min={1}
          max={100000}
          required
          defaultValue={course?.durationMinutes ?? 60}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="durationLabel">Libellé de durée</Label>
        <Input
          id="durationLabel"
          name="durationLabel"
          required
          maxLength={100}
          defaultValue={course?.durationLabel ?? "Environ 1 h"}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="format">Format</Label>
        <select
          id="format"
          name="format"
          className={`${selectClass} mt-2`}
          defaultValue={course?.format ?? "self-paced"}
        >
          {COURSE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="audience">Public</Label>
        <Textarea
          id="audience"
          name="audience"
          required
          maxLength={2000}
          defaultValue={course?.audience}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="outcomes">Résultats (un par ligne)</Label>
        <Textarea
          id="outcomes"
          name="outcomes"
          maxLength={8000}
          defaultValue={outcomes}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="prerequisites">Préalables (un par ligne)</Label>
        <Textarea
          id="prerequisites"
          name="prerequisites"
          maxLength={8000}
          defaultValue={prerequisites}
          className="mt-2"
        />
      </div>
      <div className="flex flex-wrap gap-5 md:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPurchasable"
            defaultChecked={course?.isPurchasable}
          />
          Achetable
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={course?.featured}
          />
          Mise en avant
        </label>
      </div>
      <div className="md:col-span-2">
        <Button type="submit">
          {course ? "Enregistrer la formation" : "Créer la formation"}
        </Button>
      </div>
    </form>
  );
}
