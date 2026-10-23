export const formatNaira = (value: number): string =>
  `₦${value.toLocaleString("en-NG")}`;

/** Serve smaller Cloudinary variants for product cards/lists. */
export function optimizeImage(url: string, width = 480): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (/\/upload\/(?:[^/]+,)*?(?:w_|f_auto|q_auto)/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
