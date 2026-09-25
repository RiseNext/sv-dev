import type { ReactNode, SVGProps } from 'react';

/* Inline 24px stroke icons on currentColor. Decorative by default
   (aria-hidden + focusable="false"); pass `title` only when the icon is the
   sole carrier of meaning. */

export type IconName =
  | 'arrowRight'
  | 'bank'
  | 'bolt'
  | 'briefcase'
  | 'bus'
  | 'check'
  | 'chevronDown'
  | 'chevronRight'
  | 'city'
  | 'close'
  | 'compass'
  | 'document'
  | 'download'
  | 'drain'
  | 'droplet'
  | 'external'
  | 'facebook'
  | 'fence'
  | 'hospital'
  | 'instagram'
  | 'key'
  | 'lamp'
  | 'mail'
  | 'mapPin'
  | 'menu'
  | 'pause'
  | 'phone'
  | 'plane'
  | 'play'
  | 'road'
  | 'route'
  | 'ruler'
  | 'school'
  | 'shield'
  | 'shop'
  | 'star'
  | 'temple'
  | 'train'
  | 'tree'
  | 'wall'
  | 'whatsapp'
  | 'youtube'
  | 'zoomIn';

const shapes: Record<IconName, ReactNode> = {
  arrowRight: <path d="M4 12h15m-6-6 6 6-6 6" />,
  bank: (
    <>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v9M9.5 10v9M14.5 10v9M19 10v9M3 20h18" />
    </>
  ),
  bolt: <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="4" width="16" height="13" rx="2" />
      <path d="M4 11h16M7.5 21l1-2M16.5 21l-1-2" />
      <circle cx="8" cy="14.5" r=".9" />
      <circle cx="16" cy="14.5" r=".9" />
    </>
  ),
  check: <path d="m5 13 4.5 4.5L19 7" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  city: (
    <>
      <path d="M3 21V9.5L8 6.5V21M8 21V11.5L13 8.5V21M13 21V6l8-3.5V21M3 21h18" />
      <path d="M16.5 8.5v.01M16.5 12.5v.01M16.5 16.5v.01" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" />
      <path d="M14 3v4h4M9 13h6M9 17h4" />
    </>
  ),
  download: <path d="M12 3v12m-5-4.5L12 16l5-5.5M4 20h16" />,
  drain: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="1.5" />
      <path d="M7.5 7v12M12 7v12M16.5 7v12M3 4h18" />
    </>
  ),
  droplet: <path d="M12 3.5c3.2 3.4 5 6.1 5 8.5a5 5 0 0 1-10 0c0-2.4 1.8-5.1 5-8.5Z" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      stroke="none"
      d="M14 9V7.3c0-.8.2-1.3 1.4-1.3H17V3.1A19 19 0 0 0 14.8 3C12.3 3 10.6 4.5 10.6 7v2H8v3.5h2.6V21H14v-8.5h2.6l.4-3.5H14Z"
    />
  ),
  fence: (
    <>
      <path d="M5 21V7l2-2.5L9 7v14M15 21V7l2-2.5L19 7v14" />
      <path d="M3 10.5h18M3 15h18" />
    </>
  ),
  hospital: (
    <>
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M12 9v7M8.5 12.5h7" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M18 12v3.5M15.5 12v2.5" />
    </>
  ),
  lamp: (
    <>
      <path d="M6 21h4M8 21V4h4.5a5 5 0 0 1 5 5v.5" />
      <path d="M15 9.5h5l-1.5 4.5h-2L15 9.5Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21.5s7.5-6.7 7.5-11.5a7.5 7.5 0 0 0-15 0C4.5 14.8 12 21.5 12 21.5Z" />
      <circle cx="12" cy="10" r="2.75" />
    </>
  ),
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  /* Media transport pair, added for the hero video carousel's pause control
     (WCAG 2.2.2). Stroked bars and a filled triangle so both read at the 14px
     the control renders them at. */
  pause: <path d="M9.5 5v14M14.5 5v14" />,
  phone: (
    <path d="M7 3.5 9.5 4l1.2 3.4-1.7 1.4a12 12 0 0 0 5.2 5.2l1.4-1.7 3.4 1.2.5 2.5A2 2 0 0 1 17.4 18 14.4 14.4 0 0 1 5 5.6 2 2 0 0 1 7 3.5Z" />
  ),
  plane: (
    <path d="M21.5 12c0-.7-.5-1.2-1.2-1.2h-4.9L10.9 3H9l2.6 7.8H6.4L4.6 8.4H3l1.4 3.6L3 15.6h1.6l1.8-2.4h5.2L9 21h1.9l4.5-7.8h4.9c.7 0 1.2-.5 1.2-1.2Z" />
  ),
  play: <path fill="currentColor" stroke="none" d="M8.5 5.2 19 12 8.5 18.8V5.2Z" />,
  road: (
    <>
      <path d="M4.5 21 8 3M19.5 21 16 3" />
      <path d="M12 5v2.5M12 11v2.5M12 17v2.5" />
    </>
  ),
  route: (
    <>
      <path d="M7 4h7a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h8" />
      <circle cx="5" cy="4" r="1.6" />
      <circle cx="19" cy="20" r="1.6" />
    </>
  ),
  ruler: (
    <>
      <path d="M15.5 2.5 21.5 8.5 8.5 21.5 2.5 15.5 15.5 2.5Z" />
      <path d="m12.5 5.5 2 2M9.5 8.5l2 2M6.5 11.5l2 2" />
    </>
  ),
  school: (
    <>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" />
      <path d="M6 11v4.6c0 1.6 2.7 2.9 6 2.9s6-1.3 6-2.9V11" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 8.5 4.1-.9 7-4.2 7-8.5V6l-7-3Z" />
      <path d="m9 11.8 2.2 2.2L15.5 9.8" />
    </>
  ),
  shop: (
    <>
      <path d="M4 9h16l-1.1 11H5.1L4 9Z" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
    </>
  ),
  star: (
    <path
      fill="currentColor"
      stroke="none"
      d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1.1 6.1L12 17.2l-5.5 2.9 1.1-6.1-4.4-4.3 6.1-.9L12 3.2Z"
    />
  ),
  temple: (
    <>
      <path d="M12 2.5 5.5 8.5h13L12 2.5Z" />
      <path d="M7 8.5V21h10V8.5" />
      <path d="M10 21v-4.5a2 2 0 0 1 4 0V21" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3" width="14" height="13" rx="3.5" />
      <path d="M5 10.5h14M8.5 20 6.5 22M15.5 20l2 2M9 16h6" />
      <circle cx="9" cy="13.2" r=".7" />
      <circle cx="15" cy="13.2" r=".7" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3 7.5 10.5h2.8L6.5 17h11l-3.8-6.5h2.8L12 3Z" />
      <path d="M12 17v4" />
    </>
  ),
  wall: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14c-.3.7-1.5 1.4-2.1 1.4-.6.1-1.1.3-3.7-.8-3.1-1.3-5-4.5-5.2-4.7-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.2c.1.2.1.4 0 .6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4.1.1.1.7-.2 1.4Z"
    />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4.5" />
      <path fill="currentColor" stroke="none" d="m10.2 9 5.4 3-5.4 3V9Z" />
    </>
  ),
  zoomIn: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2M8.5 11h5M11 8.5v5" />
    </>
  ),
};

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  size?: number;
  title?: string;
};

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {shapes[name]}
    </svg>
  );
}
