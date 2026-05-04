import { writeFile } from "fs/promises";
import path from "path";

export async function uploadFile(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const uploadPath = path.join(
    process.cwd(),
    "public/uploads",
    fileName
  );

  await writeFile(uploadPath, buffer);

  return `/uploads/${fileName}`;
}