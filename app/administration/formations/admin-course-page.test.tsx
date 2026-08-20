import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: { course: { findUnique } }
}));
vi.mock("@/app/administration/actions", () => ({
  addResourceAction: vi.fn(),
  archiveCourseAction: vi.fn(),
  archiveLessonAction: vi.fn(),
  archiveModuleAction: vi.fn(),
  archiveResourceAction: vi.fn(),
  createModuleAction: vi.fn(),
  duplicateCourseAction: vi.fn(),
  publishCourseAction: vi.fn(),
  saveLessonAction: vi.fn(),
  saveQuizAction: vi.fn()
}));
vi.mock("@/components/admin/course-form", () => ({
  CourseForm: () => <div>Formulaire de formation</div>
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("not-found");
  })
}));

import AdminCoursePage from "@/app/administration/formations/[id]/page";

describe("page d'administration d'une formation", () => {
  it("branche une confirmation d'archivage pour chaque niveau de contenu", async () => {
    findUnique.mockResolvedValue({
      id: "cm0course00000000000000001",
      shortTitle: "Formation test",
      status: "published",
      modules: [
        {
          id: "cm0module00000000000000001",
          title: "Introduction",
          description: null,
          position: 1,
          lessons: [
            {
              id: "cm0lesson00000000000000001",
              slug: "bienvenue",
              title: "Bienvenue",
              summary: "Première leçon",
              durationMinutes: 10,
              position: 1,
              status: "published",
              isRequired: false,
              content: {
                version: 1,
                blocks: [{ type: "paragraph", text: "Contenu" }]
              },
              quiz: null,
              resources: [
                {
                  id: "cm0resource000000000000001",
                  title: "Fiche de leçon"
                }
              ]
            }
          ]
        }
      ],
      resources: [
        {
          id: "cm0resource000000000000002",
          title: "Guide de formation",
          fileName: "guide.pdf",
          externalUrl: null
        }
      ],
      _count: { enrollments: 2 }
    });

    render(
      await AdminCoursePage({
        params: Promise.resolve({ id: "cm0course00000000000000001" }),
        searchParams: Promise.resolve({})
      })
    );

    expect(
      screen.getByRole("button", { name: "Archiver la formation" })
    ).toBeInTheDocument();
    const moduleButton = screen.getByRole("button", {
      name: "Archiver le module"
    });
    expect(moduleButton).toBeInTheDocument();
    expect(
      moduleButton
        .closest("form")
        ?.querySelector<HTMLInputElement>('input[name="moduleId"]')?.value
    ).toBe("cm0module00000000000000001");
    expect(
      screen.getByRole("button", { name: "Archiver la leçon" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Archiver la ressource" })
    ).toHaveLength(2);
  });
});
