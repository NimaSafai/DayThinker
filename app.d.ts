/// <reference types="nativewind/types" />

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

declare module "@env" {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
