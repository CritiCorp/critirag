import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import GoogleLogo from "@/components/icons/google-logo";
import { LabelInput } from "@/components/label-input";
import { LabelWrapper } from "@/components/label-wrapper";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebouncedValue } from "@/lib/debounce";
import type { OnboardingVariables } from "../../api/mutations/useOnboardingMutation";
import { useGetGoogleModelsQuery } from "../../api/queries/useGetModelsQuery";
import { useModelSelection } from "../_hooks/useModelSelection";
import { useUpdateSettings } from "../_hooks/useUpdateSettings";
import { AdvancedOnboarding } from "./advanced";

export function GoogleOnboarding({
  setSettings,
  setIsLoadingModels,
  isEmbedding = false,
  hasEnvApiKey = false,
  alreadyConfigured = false,
}: {
  setSettings: Dispatch<SetStateAction<OnboardingVariables>>;
  setIsLoadingModels?: (isLoading: boolean) => void;
  isEmbedding?: boolean;
  hasEnvApiKey?: boolean;
  alreadyConfigured?: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [getFromEnv, setGetFromEnv] = useState(
    hasEnvApiKey && !alreadyConfigured,
  );
  const debouncedApiKey = useDebouncedValue(apiKey, 500);

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useGetGoogleModelsQuery(
    getFromEnv
      ? { apiKey: "" }
      : debouncedApiKey
        ? { apiKey: debouncedApiKey }
        : undefined,
    {
      enabled: debouncedApiKey !== "" || getFromEnv || alreadyConfigured,
    },
  );

  const {
    languageModel,
    embeddingModel,
    setLanguageModel,
    setEmbeddingModel,
    languageModels,
    embeddingModels,
  } = useModelSelection(modelsData, isEmbedding);

  const handleGetFromEnvChange = (fromEnv: boolean) => {
    setGetFromEnv(fromEnv);
    if (fromEnv) {
      setApiKey("");
    }
    setEmbeddingModel?.("");
    setLanguageModel?.("");
  };

  useEffect(() => {
    setIsLoadingModels?.(isLoadingModels);
  }, [isLoadingModels, setIsLoadingModels]);

  useUpdateSettings(
    "google",
    {
      apiKey,
      languageModel,
      embeddingModel,
    },
    setSettings,
    isEmbedding,
  );

  return (
    <>
      <div className="space-y-5">
        {!alreadyConfigured && (
          <LabelWrapper
            label="Use environment Google API key"
            id="get-api-key"
            description="Reuse the key from your environment config. Turn off to enter a different key."
            flex
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={getFromEnv}
                    onCheckedChange={handleGetFromEnvChange}
                    disabled={!hasEnvApiKey}
                  />
                </div>
              </TooltipTrigger>
              {!hasEnvApiKey && (
                <TooltipContent>
                  Google API key not detected in the environment.
                </TooltipContent>
              )}
            </Tooltip>
          </LabelWrapper>
        )}
        {(!getFromEnv || alreadyConfigured) && (
          <div className="space-y-1">
            <LabelInput
              label="Google API key"
              helperText="Obtain your key from Google AI Studio (aistudio.google.com)."
              className={modelsError ? "!border-destructive" : ""}
              id="api-key"
              type="password"
              required
              placeholder={
                alreadyConfigured
                  ? "AIza•••••••••••••••••••••••••••••••••••••"
                  : "AIza..."
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={false}
            />
            {alreadyConfigured && (
              <p className="text-mmd text-muted-foreground">
                Existing Google key detected. You can reuse it or enter a new
                one.
              </p>
            )}
            {isLoadingModels && (
              <p className="text-mmd text-muted-foreground">
                Validating API key...
              </p>
            )}
            {modelsError && (
              <p className="text-mmd text-destructive">
                Invalid Google API key. Verify or replace the key.
              </p>
            )}
          </div>
        )}
      </div>
      <AdvancedOnboarding
        icon={<GoogleLogo className="w-4 h-4" />}
        languageModels={languageModels}
        embeddingModels={embeddingModels}
        languageModel={languageModel}
        embeddingModel={embeddingModel}
        setLanguageModel={setLanguageModel}
        setEmbeddingModel={setEmbeddingModel}
      />
    </>
  );
}
