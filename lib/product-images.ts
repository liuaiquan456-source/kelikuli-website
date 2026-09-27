// Custom Lab's image host rejects server-side optimizer requests. Load these
// public images directly in the browser, as the admin product list does.
export function shouldLoadImageDirectly(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.port === "" &&
      (url.hostname === "custom.kelikuli.com" ||
        url.hostname === "kelikuli-resin-studio.jocund-box-4674.chatgpt.site") &&
      url.pathname.startsWith("/media/products/");
  } catch {
    return false;
  }
}
