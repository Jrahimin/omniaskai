type IconProps = {
  className?: string;
};

export function PlusIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m10.2 10.2 3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="m4 4 8 8M12 4 4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CollapseSidebarIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9.25 4.5v15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m16.25 9.5-2.75 2.5 2.75 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExpandSidebarIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9.25 4.5v15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m13.5 9.5 2.75 2.5-2.75 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 7.15v3.2M8 5.4h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2.6 8.1 13.2 3.4 9.1 13.1 7.4 9.1 2.6 8.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 9.1 13.2 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MicIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="5.5"
        y="2.5"
        width="5"
        height="7"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 8.2a4.5 4.5 0 0 0 9 0M8 12.7v1.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="5.5"
        y="5.5"
        width="7"
        height="8"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.5 5.2V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v7.1A1.2 1.2 0 0 0 4.2 12.5H5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThumbUpIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4.2 7.2h2.1l1.2-3.4A1.4 1.4 0 0 1 8.9 2.6c.7 0 1.2.7 1 1.4L9.4 7.2H13a1.5 1.5 0 0 1 1.5 1.8l-.6 3A1.8 1.8 0 0 1 12.1 13.5H4.2V7.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M4.2 7.2H2.8v6.3h1.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ThumbDownIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M11.8 8.8H9.7l-1.2 3.4a1.4 1.4 0 0 1-1.4 1.2c-.7 0-1.2-.7-1-1.4l.5-3.2H3a1.5 1.5 0 0 1-1.5-1.8l.6-3A1.8 1.8 0 0 1 3.9 2.5h7.9v6.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11.8 8.8h1.4V2.5h-1.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ExternalIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M6.5 3.5H3.8A1.3 1.3 0 0 0 2.5 4.8v7.4A1.3 1.3 0 0 0 3.8 13.5h7.4a1.3 1.3 0 0 0 1.3-1.3V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 3.5h3.5V7M12.5 3.5 7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LightbulbIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 2.5a4 4 0 0 0-2.2 7.3c.4.3.7.8.7 1.3v.2h3v-.2c0-.5.3-1 .7-1.3A4 4 0 0 0 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 12.8h3M7 14h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckSmallIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m5.6 8.1 1.7 1.7 3.2-3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
      <path
        d="M8 1.8 9.7 5.4l4 .4-3 2.8.9 3.9L8 10.7 4.4 12.5l.9-3.9-3-2.8 4-.4L8 1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CrownIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="m2.5 11.5 1.2-7 2.6 2.6L8 3.5l1.7 3.6 2.6-2.6 1.2 7H2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 2.2v1.4M8 12.4v1.4M2.2 8h1.4M12.4 8h1.4M3.9 3.9l1 1M11.1 11.1l1 1M3.9 12.1l1-1M11.1 4.9l1-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SourcesMarkIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4 3.2h6.2L12.8 6v6.8H4V3.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 3.2V6h2.6M6 8.4h4M6 10.8h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CollectionIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M3 5.2h10M3 8h10M3 10.8h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="2.8"
        y="3.8"
        width="10.4"
        height="9.4"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.8 6.6h10.4M5.2 2.8v2M10.8 2.8v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkSmallIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 2 8.8 6.4 13 7.2 8.8 8 8 12.4 7.2 8 3 7.2 7.2 6.4 8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="2.5"
        y="5.5"
        width="11"
        height="8"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6 5.5V4.2A1.2 1.2 0 0 1 7.2 3h1.6A1.2 1.2 0 0 1 10 4.2v1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function WalletIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="2.5"
        y="4.5"
        width="11"
        height="8.2"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10.6" cy="8.6" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="m2.8 7.4 5.2-4.4 5.2 4.4V13a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1V7.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrendIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2.5 11.5 6 8l2.5 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 5h3.3v3.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M3.2 3.2h4.2A1.6 1.6 0 0 1 9 4.8v8L7.2 11.6 5.4 12.8V4.8A1.6 1.6 0 0 0 3.8 3.2H3.2v9.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 4.8h3.8A1.4 1.4 0 0 1 14.2 6.2v6.6H9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilmIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="2.6"
        y="3.2"
        width="10.8"
        height="9.6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.6 6.2h10.8M2.6 9.8h10.8M5.4 3.2v9.6M10.6 3.2v9.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function GuideIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4 3.2h8v9.6H4V3.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6 6h4M6 8.4h4M6 10.8h2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalculatorIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <rect
        x="4"
        y="2.5"
        width="8"
        height="11"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6 5h4M6 8h1M9 8h1M6 10.4h1M9 10.4h1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UpdatesIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M12.6 8A4.6 4.6 0 1 1 8 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 3.4h3.2V6.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScenariosIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="5" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.8 12.2c.4-1.6 1.6-2.5 3.2-2.5s2.8.9 3.2 2.5M8.8 12.2c.3-1.2 1.2-2 2.4-2s2.1.8 2.4 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4.4 6.4 8 10l3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 2.3 3.4 4.2v3.4c0 2.9 1.9 4.8 4.6 6.1 2.7-1.3 4.6-3.2 4.6-6.1V4.2L8 2.3Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileDocIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4.2 2.8h5.2L12 5.6v7.6H4.2V2.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 2.8V5.6H12M6 8.2h4M6 10.4h2.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
