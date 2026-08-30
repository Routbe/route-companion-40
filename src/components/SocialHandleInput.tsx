import { SocialPlatformIcon } from "@/lib/social-icons";
import { extractHandle, handlePrefix } from "@/lib/social-handles";
import { brandOf } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface Props {
  /** Platform-identifier, bv. "instagram". */
  kind: string;
  /** Zichtbaar platformlabel, bv. "Instagram". */
  label?: string;
  /** Pure handle zonder `@`. */
  value: string;
  onChange: (handle: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Handle-invoerveld met vast platformprefix (`instagram.com/`) en smart paste:
 * een geplakte volledige URL wordt automatisch tot de gebruikersnaam herleid.
 */
export function SocialHandleInput({
  kind,
  label,
  value,
  onChange,
  placeholder = "gebruikersnaam",
  disabled,
  className,
}: Props) {
  const prefix = handlePrefix(kind) ?? "";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-foreground/40",
        disabled && "opacity-60",
        className,
      )}
    >
      <span className="shrink-0" style={{ color: brandOf(kind) }} aria-hidden>
        <SocialPlatformIcon source={kind} className="h-4 w-4 text-current" />
      </span>
      <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
        {prefix}
      </span>
      <input
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        maxLength={200}
        aria-label={label ? `${label} gebruikersnaam` : "Gebruikersnaam"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(extractHandle(kind, e.target.value))}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (!pasted) return;
          e.preventDefault();
          onChange(extractHandle(kind, pasted));
        }}
        onBlur={(e) => onChange(extractHandle(kind, e.target.value))}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
