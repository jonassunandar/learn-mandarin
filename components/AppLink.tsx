"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
/** Offline navigation must use cached HTML rather than Next's network-only RSC request. */
export default function AppLink({
  onClick,
  ...props
}: ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (
          !navigator.onLine &&
          typeof props.href === "string" &&
          props.href.startsWith("/") &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          event.preventDefault();
          window.location.assign(props.href);
        }
      }}
    />
  );
}
