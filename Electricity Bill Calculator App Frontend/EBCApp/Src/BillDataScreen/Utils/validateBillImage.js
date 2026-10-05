// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
  "image/heif",
];

// 1.5 MB in bytes
export const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024;

/**
 * Validates an image asset from expo-image-picker.
 * Returns { valid: boolean, message?: string }.
 *
 * @param {{ uri, name, type, size }} image
 */
export const validateBillImage = (image) => {
  if (!image) {
    return { valid: false, message: "Please upload a bill image." };
  }

  // ---- Type check ----
  // On web the picker provides `type` (MIME).
  // On some native devices only the filename extension is reliable —
  // fall back to checking the name's extension if type is missing.
  const mime = (image.type || "").toLowerCase();
  const nameLower = (image.name || "").toLowerCase();

  const hasValidMime = mime && ALLOWED_IMAGE_TYPES.includes(mime);
  const hasValidExtension = /\.(png|jpe?g|webp|heic|heif)$/i.test(nameLower);

  if (!hasValidMime && !hasValidExtension) {
    return {
      valid: false,
      message:
        "Unsupported image format. Please use PNG, JPG, JPEG, WEBP, HEIC, or HEIF.",
    };
  }

  // ---- Size check ----
  if (typeof image.size === "number" && image.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      message: "Image is too large. Please choose an image under 1.5 MB.",
    };
  }

  return { valid: true };
};

/**
 * Converts an expo-image-picker asset into a Blob/File ready for FormData.
 * Handles both web (fetch from blob URL) and native (fetch from file:// URI).
 *
 * On web: returns a real File object with proper name + MIME.
 * On native: returns a Blob (FormData on native accepts { uri, name, type }).
 */
export const imageToFormPart = async (image) => {
  // On web we can fetch the blob URL and wrap it in a File
  if (typeof window !== "undefined" && typeof File !== "undefined") {
    const res = await fetch(image.uri);
    const blob = await res.blob();
    return new File([blob], image.name || "bill.jpg", {
      type: image.type || blob.type || "image/jpeg",
    });
  }

  // On native, react-native's FormData accepts this shape directly
  return {
    uri: image.uri,
    name: image.name || "bill.jpg",
    type: image.type || "image/jpeg",
  };
};
