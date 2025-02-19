/* eslint-disable @typescript-eslint/no-restricted-imports */
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const clsMerge = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export { clsMerge };
