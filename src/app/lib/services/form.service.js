// import { sendFormEmails } from "../email.js";
import { sendFormEmails } from "../email.js";
import { prisma } from "../prisma.js";
// import { prisma } from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";

// ── Generate slug ─────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Get all forms ─────────────────────────────────────────

export async function getAllForms() {
  return prisma.form.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { submissions: true } },
    },
  });
}

// ── Get form by id ────────────────────────────────────────

export async function getFormById(id) {
  const form = await prisma.form.findUnique({
    where: { id: Number(id) },
  });
  if (!form) throw new ApiError(404, "Form not found");
  return form;
}

// ── Get form by slug (public) ─────────────────────────────

export async function getFormBySlug(slug) {
  const form = await prisma.form.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      fields: true,
      submitButtonLabel: true,
      confirmationType: true,
      confirmationMessage: true,
      redirectUrl: true,
      status: true,
    },
  });
  if (!form) throw new ApiError(404, "Form not found");
  if (form.status !== "active") throw new ApiError(403, "Form is not active");
  return form;
}

// ── Create form ───────────────────────────────────────────

export async function createForm(input) {
  const baseSlug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.title || "untitled-form");

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.form.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return prisma.form.create({
    data: {
      title: input.title || "Untitled Form",
      slug,
      fields: input.fields ?? [],
      submitButtonLabel: input.submitButtonLabel ?? "Submit",
      confirmationType: input.confirmationType ?? "message",
      confirmationMessage:
        input.confirmationMessage ?? "Thank you for your submission.",
      redirectUrl: input.redirectUrl ?? null,
      emails: input.emails ?? [],
      status: input.status ?? "active",
    },
  });
}

// ── Update form ───────────────────────────────────────────

export async function updateForm(id, input) {
  const { id: _, createdAt, updatedAt, ...data } = input;

  // Handle slug uniqueness
  if (data.slug) {
    data.slug = generateSlug(data.slug);
    const existing = await prisma.form.findUnique({
      where: { slug: data.slug },
    });
    if (existing && existing.id !== Number(id)) {
      throw new ApiError(400, `Slug "${data.slug}" is already taken`);
    }
  }

  return prisma.form.update({
    where: { id: Number(id) },
    data,
  });
}

// ── Delete form ───────────────────────────────────────────

export async function deleteForm(id) {
  return prisma.form.delete({ where: { id: Number(id) } });
}

// ── Get submissions for a form ────────────────────────────

export async function getFormSubmissions(
  formId,
  { page = 1, perPage = 20 } = {},
) {
  const where = { formId: Number(formId) };

  const [total, submissions] = await Promise.all([
    prisma.formSubmission.count({ where }),
    prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    submissions,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// ── Submit a form ─────────────────────────────────────────

export async function submitForm(slug, data, ipAddress) {
  // Get full form including emails
  const form = await prisma.form.findUnique({ where: { slug } });
  if (!form) throw new ApiError(404, "Form not found");
  if (form.status !== "active") throw new ApiError(403, "Form is not active");

  // Validate required fields
  const fields = Array.isArray(form.fields) ? form.fields : [];
  const errors = [];

  for (const field of fields) {
    if (field.required && !data[field.name]?.toString().trim()) {
      errors.push(`${field.label || field.name} is required`);
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  // Save submission
  const submission = await prisma.formSubmission.create({
    data: {
      formId: form.id,
      data,
      ipAddress: ipAddress || null,
    },
  });

  // Send emails
  const emailConfigs = Array.isArray(form.emails) ? form.emails : [];
  if (emailConfigs.length > 0) {
    await sendFormEmails(emailConfigs, data);
  }

  return {
    submission,
    confirmationType: form.confirmationType,
    confirmationMessage: form.confirmationMessage,
    redirectUrl: form.redirectUrl,
  };
}

// ── Delete a submission ───────────────────────────────────

export async function deleteSubmission(id) {
  return prisma.formSubmission.delete({ where: { id: Number(id) } });
}
