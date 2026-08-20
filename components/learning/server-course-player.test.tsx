import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServerCoursePlayer } from "@/components/learning/server-course-player";
import type {
  LearningModule,
  PublicCourseSummary
} from "@/components/lms/types";
import { getTrainingProgressKey } from "@/lib/training";

const course: PublicCourseSummary = {
  id: "cm0course00000000000000001",
  slug: "cours-test",
  title: "Cours de test",
  shortTitle: "Cours de test",
  description: "Une formation utilisée par les tests.",
  theme: "internet",
  level: "beginner",
  offer: "free",
  priceCents: 0,
  currency: "cad",
  priceLabel: "Gratuite",
  durationMinutes: 10,
  durationLabel: "10 min",
  format: "self-paced",
  audience: "Testeurs",
  outcomes: ["Tester"],
  prerequisites: [],
  status: "published",
  isPurchasable: false,
  featured: false,
  lessonCount: 1
};

const modules: LearningModule[] = [
  {
    id: "cm0module0000000000000001",
    title: "Module principal",
    description: null,
    position: 1,
    lessons: [
      {
        id: "cm0lesson0000000000000001",
        slug: "lecon-1",
        title: "Première leçon",
        summary: "Résumé de la leçon.",
        durationMinutes: 10,
        position: 1,
        isRequired: true,
        content: {
          version: 1,
          blocks: [{ type: "paragraph", text: "Contenu sûr." }]
        },
        quiz: null,
        resources: [
          {
            id: "cm0resource00000000000001",
            title: "Guide externe protégé",
            description: null,
            kind: "link",
            fileName: null
          }
        ]
      }
    ]
  }
];

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("lecteur LMS avec progression serveur", () => {
  it("enregistre la fin d’une leçon dans l’API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ enrollment: {} })));
    const user = userEvent.setup();

    render(
      <ServerCoursePlayer
        course={course}
        modules={modules}
        initialProgress={[]}
        initialLastLessonId={null}
        certificateToken={null}
        courseResources={[]}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /terminer la formation/i })
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    ).toMatchObject({
      operation: "update",
      courseId: course.id,
      lessonId: modules[0]!.lessons[0]!.id,
      status: "completed"
    });
  });

  it("demande une confirmation avant l’import local unique", async () => {
    window.localStorage.setItem(
      getTrainingProgressKey(course.slug),
      JSON.stringify({
        version: 1,
        courseSlug: course.slug,
        completedLessonIds: ["lecon-1"],
        lastLessonId: "lecon-1"
      })
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ alreadyImported: false }))
      );
    const user = userEvent.setup();

    render(
      <ServerCoursePlayer
        course={course}
        modules={modules}
        initialProgress={[]}
        initialLastLessonId={null}
        certificateToken={null}
        courseResources={[]}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /importer une ancienne progression/i })
    );
    expect(
      screen.getByRole("heading", {
        name: /importer la progression de cet appareil/i
      })
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: /confirmer l’import/i })
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    ).toMatchObject({
      operation: "import_legacy",
      confirmed: true
    });
  });

  it("ne révèle jamais l’URL externe d’une ressource dans la page", () => {
    render(
      <ServerCoursePlayer
        course={course}
        modules={modules}
        initialProgress={[]}
        initialLastLessonId={null}
        certificateToken={null}
        courseResources={[]}
      />
    );

    const link = screen.getByRole("link", {
      name: /guide externe protégé/i
    });
    expect(link).toHaveAttribute(
      "href",
      "/api/lms/resources/cm0resource00000000000001/download"
    );
  });
});
