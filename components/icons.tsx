import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
      {...props}
    />
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </Svg>
  );
}

export function DressIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 5 2.8 2.3 4.7-.8.7 3-3.8 2.5V20H7.6v-7.9L3.8 9.5l.7-3 4.7.8L12 5Z" />
    </Svg>
  );
}

export function BookingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3.5v3M16 3.5v3M7.5 10.5h9M9 14h.01M12 14h.01M15 14h.01" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17M8 13.5h3M8 17h3M13 13.5h3" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16.5 19.5v-1.2c0-1.7-1.4-3.1-3.1-3.1H8.6c-1.7 0-3.1 1.4-3.1 3.1v1.2" />
      <circle cx="11" cy="8.5" r="3.5" />
      <path d="M18.5 15.5v-.6c0-1.5-1.1-2.8-2.5-3.1M17 5.5c1.4.4 2.4 1.7 2.4 3.2" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 16.5h12l-1.4-1.8v-4A4.6 4.6 0 0 0 12 6a4.6 4.6 0 0 0-4.6 4.7v4L6 16.5Z" />
      <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
      <path d="M3.5 10a3.5 3.5 0 0 0 3.5-3.5M20.5 10A3.5 3.5 0 0 1 17 6.5M3.5 14A3.5 3.5 0 0 1 7 17.5M20.5 14A3.5 3.5 0 0 0 17 17.5" />
      <circle cx="12" cy="12" r="2.2" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 4.8h2.1l1 4.2-1.8 1.4a13.9 13.9 0 0 0 4.8 4.8L15 13l4.2 1v2.1a1.9 1.9 0 0 1-2.1 1.9c-6.3-.7-11.3-5.7-12-12A1.9 1.9 0 0 1 7.5 4.8Z" />
    </Svg>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 18.5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5h12A2.5 2.5 0 0 1 20.5 7v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 2v-2Z" />
      <path d="M8 9.5h8M8 13h5" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.8" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.2 2.2 4.8-5.1" />
    </Svg>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 8H4.5v3.5" />
      <path d="M4.5 11.5A7 7 0 0 0 11 18h4.3" />
      <path d="M16 16h3.5v3.5" />
      <path d="M19.5 19.5A7 7 0 0 0 13 5H8.7" />
    </Svg>
  );
}

export function DeliveryIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="6.5" width="14" height="12" rx="2.5" />
      <path d="M8 10h8M8 13.5h8" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 12h12" />
      <path d="m11 7 5 5-5 5" />
    </Svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="14" r="3.5" />
    </Svg>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.5A7.5 7.5 0 0 0 4.5 12c0 4.1 3.1 7.5 7 7.5h.5a1.8 1.8 0 0 0 1.8-1.8c0-.9-.7-1.6-1.5-1.8-.7-.1-1.3-.8-1.3-1.5 0-.9.7-1.6 1.6-1.6h2.4a4.5 4.5 0 0 0 0-9h-3Z" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="9.5" cy="8.5" r="1" />
      <circle cx="13" cy="7.5" r="1" />
      <circle cx="15.5" cy="10" r="1" />
    </Svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 18 12-12 2 2-12 12H6v-2Z" />
      <path d="M11 8.5 15.5 13M13.5 6l4.5 4.5" />
    </Svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 4.5H5.5v5.6l8.9 8.9 5.1-5.1L11 4.5Z" />
      <circle cx="8.5" cy="8.5" r="1" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
    </Svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m5 14 .7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14ZM19 13l.6 2L22 15.6l-2.4.7L19 19l-.6-2.7L16 15.6l2.4-.7L19 13Z" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 5-7 7 7 7" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}
