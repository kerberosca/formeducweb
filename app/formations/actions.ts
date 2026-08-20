"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";
import { enrollUserInCourse } from "@/lib/lms/enrollments";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function enrollFreeCourseAction(formData: FormData) {
  const slug = slugSchema.parse(formData.get("courseSlug"));
  const user = await getAuthenticatedLmsUser();
  await enrollUserInCourse(user.id, { courseSlug: slug });
  redirect(`/formations/${slug}/apprendre`);
}
