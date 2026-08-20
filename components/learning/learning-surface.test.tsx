import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CourseCatalog } from "@/components/learning/course-catalog";
import { LocalCoursePlayer } from "@/components/learning/local-course-player";
import type { PublicCourseSummary } from "@/components/lms/types";
import {
  courses,
  getCourseBySlug,
  getTrainingProgressKey,
  type TrainingCourse
} from "@/lib/training";

afterEach(() => cleanup());

describe("catalogue de formations", () => {
  const catalogCourses: PublicCourseSummary[] = (
    courses as readonly TrainingCourse[]
  ).map((course) => ({
    ...course,
    id: `test-${course.slug}`,
    priceCents: course.offer === "free" ? 0 : null,
    currency: "cad",
    status: course.availability === "preparation" ? "preparation" : "published",
    isPurchasable: Boolean(course.isPurchasable),
    featured: Boolean(course.featured),
    lessonCount: course.lessons.length,
    outcomes: [...course.outcomes],
    prerequisites: [...course.prerequisites]
  }));

  it("couvre les six sujets et filtre les accès gratuits", async () => {
    const user = userEvent.setup();
    render(<CourseCatalog courses={catalogCourses} />);

    expect(courses).toHaveLength(6);
    expect(new Set(courses.map((course) => course.theme))).toEqual(
      new Set([
        "internet",
        "ai",
        "excel",
        "word",
        "cybersecurity",
        "automation"
      ])
    );

    await user.selectOptions(screen.getByLabelText("Accès"), "free");

    expect(screen.getByText("3 formations trouvées")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Internet sans stress" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Excel essentiel" })
    ).not.toBeInTheDocument();
  });

  it("recherche sans tenir compte des accents", async () => {
    const user = userEvent.setup();
    render(<CourseCatalog courses={catalogCourses} />);

    await user.type(screen.getByLabelText("Mot-clé"), "cybersecurite");

    expect(screen.getByText("1 formation trouvée")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Réflexes cybersécurité" })
    ).toBeInTheDocument();
  });
});

describe("lecteur de formation locale", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("enregistre seulement la progression du cours sur l’appareil", async () => {
    const user = userEvent.setup();
    const course = getCourseBySlug("internet-sans-stress");
    expect(course?.offer).toBe("free");
    if (!course) throw new Error("Formation de test introuvable");

    render(<LocalCoursePlayer course={course} />);

    await user.click(
      screen.getByRole("button", { name: /terminer et continuer/i })
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Chercher et vérifier une information"
      })
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = window.localStorage.getItem(
        getTrainingProgressKey(course.slug)
      );
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored || "{}")).toEqual({
        version: 1,
        courseSlug: "internet-sans-stress",
        completedLessonIds: ["navigateur"],
        lastLessonId: "recherche-fiable"
      });
    });
  });
});
