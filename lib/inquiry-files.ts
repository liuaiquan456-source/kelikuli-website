import path from "node:path";
export const designExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "ai",
  "eps",
  "stl",
  "obj",
  "zip",
]);
export const maxDesignSize = 30 * 1024 * 1024;
export function inquiryFilesDirectory() {
  if (process.env.INQUIRY_UPLOAD_DIR) return process.env.INQUIRY_UPLOAD_DIR;
  if (process.env.PROJECT_ROOT)
    return path.join(process.env.PROJECT_ROOT, "private", "inquiries");
  return path.join(process.cwd(), "private", "inquiries");
}
