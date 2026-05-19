import { readonly, ref } from "vue";

export type ConfirmDialogOptions = {
  eyebrow?: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: string;
  isDestructive?: boolean;
};

type ConfirmDialogState = ConfirmDialogOptions & {
  open: boolean;
};

const state = ref<ConfirmDialogState | null>(null);
let resolver: ((value: boolean) => void) | null = null;

const closeDialog = (result: boolean) => {
  state.value = null;

  if (resolver) {
    const resolve = resolver;
    resolver = null;
    resolve(result);
  }
};

export const useConfirmDialog = () => {
  const confirm = (options: ConfirmDialogOptions) => {
    if (resolver) {
      closeDialog(false);
    }

    state.value = {
      open: true,
      confirmColor: options.confirmColor ?? (options.isDestructive ? "error" : "primary"),
      ...options,
    };

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  };

  return {
    dialogState: readonly(state),
    confirm,
    close: () => closeDialog(false),
    accept: () => closeDialog(true),
  };
};
