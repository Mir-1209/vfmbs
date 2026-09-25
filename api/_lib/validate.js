import { HttpError } from "./http.js";

const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function str(v, name, { max = 200, required = false, min = 0 } = {}) {
  const s = (v == null ? "" : String(v)).replace(CTRL, "").trim();
  if (required && !s) throw new HttpError(400, `${name} is required.`);
  if (s.length > max) throw new HttpError(400, `${name} is too long (max ${max} characters).`);
  if (s && s.length < min) throw new HttpError(400, `${name} is too short.`);
  return s;
}

export function email(v, name = "Email") {
  const s = str(v, name, { max: 160, required: true }).toLowerCase();
  if (!/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(s)) throw new HttpError(400, "Please enter a valid email address.");
  return s;
}

export function oneOf(v, name, opts, fallback) {
  if (v == null || v === "") { if (fallback !== undefined) return fallback; throw new HttpError(400, `${name} is required.`); }
  if (!opts.includes(v)) throw new HttpError(400, `Invalid ${name}.`);
  return v;
}

export function list(v, name, { max = 10, itemMax = 60 } = {}) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, max).map((x) => str(x, name, { max: itemMax })).filter(Boolean);
}

export function url(v, name) {
  const s = str(v, name, { max: 300 });
  if (!s) return "";
  if (!/^https?:\/\/[^\s]+$/i.test(s)) throw new HttpError(400, `${name} must be a full link starting with https://`);
  return s;
}

// Bots fill every field; humans never see this one.
export const isBot = (b) => Boolean(b && (b.website || b.company_website));
