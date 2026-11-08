"use client";

import { RefreshIcon } from "@nuvui/icons";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
  Button,
} from "@nuvui/react";
import { useEffect } from "react";

/**
 * A page that failed to render. The error itself is logged, never shown:
 * its message can hold details that aren't for the reader.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell__page">
      <Alert intent="danger">
        <AlertTitle>This page couldn't be loaded</AlertTitle>
        <AlertDescription>
          Something went wrong on our side. Try again, and if it keeps
          happening, quote reference {error.digest ?? "unknown"}.
        </AlertDescription>
        <AlertActions>
          <Button intent="secondary" size="sm" onClick={() => reset()}>
            <RefreshIcon size={16} aria-hidden="true" />
            Try again
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
