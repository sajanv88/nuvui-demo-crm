"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@nuvui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The sheet a contact opens in when it's chosen from inside the app (the
 * intercepted route). Closing it goes back, which takes the URL back to the
 * list with its page and filters. A reload or a shared link shows the full
 * page instead.
 */
export function ContactSheet({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Sheet
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <SheetContent side="end" size="md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
