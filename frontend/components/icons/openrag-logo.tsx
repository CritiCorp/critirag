interface CritiRagLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function CritiRagLogo({ width = 50, height = 41, className }: CritiRagLogoProps) {
  return (
    <img
      src="/critico-logo.svg"
      alt="CritiRAG Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
