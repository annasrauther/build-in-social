"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "@/components/providers/Toaster";

/**
 * Optimistic-update helper built on top of TanStack Query.
 *
 * Rule for this app (from the plan): user-initiated mutations update
 * the UI immediately, not after the server round-trip. If the server
 * rejects, we roll back and show a toast.
 *
 * Usage:
 *
 * ```ts
 * const mutation = useOptimistic<ReorderVars, Day[]>({
 *   queryKey: ["plan", weekId],
 *   mutationFn: (vars) => fetch("/api/plan/reorder", { method: "POST", body: JSON.stringify(vars) }),
 *   applyOptimistic: (current, vars) => reorderLocally(current, vars),
 *   errorMessage: "We couldn't reorder the week. Try again.",
 * });
 *
 * mutation.mutate({ fromId, toId });
 * ```
 *
 * For destructive actions that should execute immediately with an Undo
 * affordance rather than a rollback, use `toast.undo(...)` directly
 * from `@/components/providers/Toaster` and skip this helper.
 */

export interface UseOptimisticOptions<TVars, TData>
  extends Omit<
    UseMutationOptions<unknown, Error, TVars, { previous: TData | undefined }>,
    "onMutate" | "onError" | "onSettled"
  > {
  /** React Query cache key whose data is being optimistically updated. */
  queryKey: QueryKey;
  /**
   * Produce the next cache snapshot from the current snapshot + vars.
   * Called synchronously at mutate-time.
   */
  applyOptimistic: (current: TData | undefined, vars: TVars) => TData | undefined;
  /**
   * User-facing error message on server rejection. Keep it human and
   * actionable — no stack traces. Optional; a sensible default is used.
   */
  errorMessage?: string;
  /** Called after successful invalidation. Useful for side effects. */
  onSuccessToast?: string;
}

export function useOptimistic<TVars, TData>({
  queryKey,
  applyOptimistic,
  errorMessage = "Something went wrong. Try again.",
  onSuccessToast,
  ...options
}: UseOptimisticOptions<TVars, TData>) {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    TVars,
    { previous: TData | undefined }
  >({
    ...options,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<TData>(queryKey);
      qc.setQueryData<TData>(queryKey, (current) =>
        applyOptimistic(current, vars)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData<TData>(queryKey, context.previous);
      }
      toast.error(errorMessage);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
    onSuccess: (...args) => {
      if (onSuccessToast) toast.success(onSuccessToast);
      return options.onSuccess?.(...args);
    },
  });
}
