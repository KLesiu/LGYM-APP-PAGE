import { readonly, ref } from "vue";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastParams = Record<string, unknown>;

export type ToastInput = {
  type: ToastType;
  resourceKey: string;
  params?: ToastParams;
  timeout?: number;
};

export type ToastItem = ToastInput & {
  id: number;
};

const DEFAULT_TIMEOUT = 3800;

const toasts = ref<ToastItem[]>([]);
const timers = new Map<number, number>();
let nextToastId = 1;

const clearToastTimer = (id: number) => {
  const timer = timers.get(id);
  if (timer === undefined || typeof window === "undefined") return;

  window.clearTimeout(timer);
  timers.delete(id);
};

const remove = (id: number) => {
  clearToastTimer(id);
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

const push = ({ timeout = DEFAULT_TIMEOUT, ...input }: ToastInput) => {
  const id = nextToastId++;

  toasts.value = [
    {
      id,
      timeout,
      ...input,
    },
    ...toasts.value,
  ];

  if (typeof window !== "undefined" && timeout > 0) {
    timers.set(
      id,
      window.setTimeout(() => {
        remove(id);
      }, timeout),
    );
  }

  return id;
};

export function useToast() {
  return {
    toasts: readonly(toasts),
    remove,
    clear: () => {
      for (const toast of toasts.value) {
        clearToastTimer(toast.id);
      }
      toasts.value = [];
    },
    toast: (input: ToastInput) => push(input),
    success: (resourceKey: string, params?: ToastParams, timeout?: number) =>
      push({ type: "success", resourceKey, params, timeout }),
    error: (resourceKey: string, params?: ToastParams, timeout?: number) =>
      push({ type: "error", resourceKey, params, timeout }),
    warning: (resourceKey: string, params?: ToastParams, timeout?: number) =>
      push({ type: "warning", resourceKey, params, timeout }),
    info: (resourceKey: string, params?: ToastParams, timeout?: number) =>
      push({ type: "info", resourceKey, params, timeout }),
  };
}
