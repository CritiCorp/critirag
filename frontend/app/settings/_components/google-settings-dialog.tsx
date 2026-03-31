"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateSettingsMutation } from "@/app/api/mutations/useUpdateSettingsMutation";
import { useGetGoogleModelsQuery } from "@/app/api/queries/useGetModelsQuery";
import { useGetSettingsQuery } from "@/app/api/queries/useGetSettingsQuery";
import type { ProviderHealthResponse } from "@/app/api/queries/useProviderHealthQuery";
import GoogleLogo from "@/components/icons/google-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import ModelProviderDialogFooter from "./model-provider-dialog-footer";
import {
  GoogleSettingsForm,
  type GoogleSettingsFormData,
} from "./google-settings-form";

const GoogleSettingsDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { isAuthenticated, isNoAuthMode } = useAuth();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<Error | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const router = useRouter();

  const { data: settings = {} } = useGetSettingsQuery({
    enabled: isAuthenticated || isNoAuthMode,
  });

  const isGoogleConfigured = settings.providers?.google?.configured === true;

  const canRemoveGoogle =
    isGoogleConfigured &&
    (settings.providers?.anthropic?.configured === true ||
      settings.providers?.openai?.configured === true ||
      settings.providers?.watsonx?.configured === true ||
      settings.providers?.ollama?.configured === true);

  const methods = useForm<GoogleSettingsFormData>({
    mode: "onSubmit",
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    if (open) methods.reset();
  }, [open]);

  const { handleSubmit, watch } = methods;
  const apiKey = watch("apiKey");

  const { refetch: validateCredentials } = useGetGoogleModelsQuery(
    { apiKey },
    { enabled: false },
  );

  const settingsMutation = useUpdateSettingsMutation({
    onSuccess: () => {
      const healthData: ProviderHealthResponse = {
        status: "healthy",
        message: "Provider is configured and working correctly",
        provider: "google",
      };
      queryClient.setQueryData(["provider", "health"], healthData);

      toast.message("Google successfully configured", {
        description:
          "You can now access the provided language and embedding models.",
        duration: Infinity,
        closeButton: true,
        icon: <GoogleLogo className="w-4 h-4" />,
        action: {
          label: "Settings",
          onClick: () => {
            router.push("/settings?focusLlmModel=true");
          },
        },
      });
      setOpen(false);
    },
  });

  const removeMutation = useUpdateSettingsMutation({
    onSuccess: () => {
      toast.success("Google configuration removed");
      setShowRemoveConfirm(false);
      setOpen(false);
    },
  });

  const onSubmit = async (data: GoogleSettingsFormData) => {
    setValidationError(null);

    if (data.apiKey) {
      setIsValidating(true);
      const result = await validateCredentials();
      setIsValidating(false);

      if (result.isError) {
        setValidationError(result.error);
        return;
      }
    }

    const payload: { google_api_key?: string } = {};
    if (data.apiKey) {
      payload.google_api_key = data.apiKey;
    }

    settingsMutation.mutate(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setShowRemoveConfirm(false);
        setOpen(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-white border">
                  <GoogleLogo className="w-4 h-4" />
                </div>
                Google Setup
              </DialogTitle>
            </DialogHeader>

            <GoogleSettingsForm
              modelsError={validationError}
              isLoadingModels={isValidating}
            />

            <AnimatePresence mode="wait">
              {settingsMutation.isError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="rounded-lg border border-destructive p-4">
                    {settingsMutation.error?.message}
                  </p>
                </motion.div>
              )}
              {removeMutation.isError && (
                <motion.div
                  key="remove-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="rounded-lg border border-destructive p-4">
                    {removeMutation.error?.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <ModelProviderDialogFooter
              showRemoveConfirm={showRemoveConfirm}
              onCancelRemove={() => setShowRemoveConfirm(false)}
              onConfirmRemove={() =>
                removeMutation.mutate({ remove_google_config: true })
              }
              isRemovePending={removeMutation.isPending}
              isConfigured={isGoogleConfigured}
              canRemove={canRemoveGoogle}
              removeDisabledTooltip="Configure another model provider before removing Google"
              onRequestRemove={() => setShowRemoveConfirm(true)}
              onCancel={() => setOpen(false)}
              isSavePending={settingsMutation.isPending}
              isValidating={isValidating}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSettingsDialog;
