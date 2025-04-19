export const supportedFileTypes = {
  "application/pdf": "PDF",

  // Word Documents
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",

  // PowerPoint Presentations
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PPTX",

  // Images
  "image/jpeg": "JPG, JPEG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/svg+xml": "SVG",
  "image/webp": "WEBP",

  // Videos
  "video/mp4": "MP4",
  "video/mpeg": "MPEG",
  "video/ogg": "OGV",
  "video/webm": "WEBM",
  "video/x-msvideo": "AVI",

  // Text files
  "text/plain": "TXT",

  // ZIP & Compressed Files
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP (Compressed)",
  "application/x-rar-compressed": "RAR",
  "application/x-7z-compressed": "7Z",
  "application/x-tar": "TAR",
  "application/gzip": "GZ",
};

// Function to get category
export const getFileCategory = (type) => supportedFileTypes[type] || null;
