import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicForm } from "@/modules/lead-forms";
import { PublicLeadForm } from "@/modules/lead-forms/components/public-lead-form";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

async function loadForm(orgSlug: string, formSlug: string) {
  try {
    return await getPublicForm(orgSlug, formSlug);
  } catch (error) {
    if (error instanceof AppError && error.code === ApiErrorCode.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; formSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, formSlug } = await params;
  try {
    const form = await getPublicForm(orgSlug, formSlug);
    return {
      title: form.name,
      description: form.description ?? undefined,
      robots: form.allowIndexing ? undefined : { index: false, follow: false },
    };
  } catch {
    return { title: "Form", robots: { index: false, follow: false } };
  }
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ orgSlug: string; formSlug: string }>;
}) {
  const { orgSlug, formSlug } = await params;
  const form = await loadForm(orgSlug, formSlug);

  return <PublicLeadForm orgSlug={orgSlug} formSlug={formSlug} form={form} />;
}
