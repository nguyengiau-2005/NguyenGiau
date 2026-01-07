// Utility to normalize various image representations into a React Native Image source
export default function toImageSource(input: any): { uri: string } | undefined {
  if (!input) return undefined;

  // If it's already a string, treat as URL
  if (typeof input === 'string') return { uri: input };

  // If it's an array, take first element
  if (Array.isArray(input) && input.length > 0) return toImageSource(input[0]);

  // If it's an object wrapper like { value: {...} } or { file: {...} }, unwrap it
  if (typeof input === 'object') {
    if ('value' in input) return toImageSource((input as any).value);
    if ('file' in input) return toImageSource((input as any).file);
    if ('data' in input) return toImageSource((input as any).data);

    // Common Baserow file shape
    if ('url' in input && input.url) return { uri: input.url };

    // Thumbnails (prefer small -> card_cover -> tiny)
    if ('thumbnails' in input && input.thumbnails) {
      const t = input.thumbnails as any;
      if (t.small && t.small.url) return { uri: t.small.url };
      if (t.card_cover && t.card_cover.url) return { uri: t.card_cover.url };
      if (t.tiny && t.tiny.url) return { uri: t.tiny.url };
    }

    // Some Baserow setups return nested objects like { id, uploaded_at, name } directly
    // or sometimes wrapped in an object with `download_url`/`file_url`.
    if ('download_url' in input && input.download_url) return { uri: input.download_url };
    if ('file_url' in input && input.file_url) return { uri: input.file_url };
    if ('path' in input && input.path) return { uri: input.path };

    // If object looks like { id: number, name: string, thumbnails: {...} } but no url found,
    // try serializing a thumbnail fallback by searching nested keys.
    for (const key of ['small', 'card_cover', 'tiny']) {
      if (input.thumbnails && input.thumbnails[key] && input.thumbnails[key].url) {
        return { uri: input.thumbnails[key].url };
      }
    }
  }

  return undefined;
}
