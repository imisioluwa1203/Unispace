function Svg({ children }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const MailIcon = () => (
  <Svg><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 8 9 6 9-6" /></Svg>
);
export const LockIcon = () => (
  <Svg><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>
);
export const UserIcon = () => (
  <Svg><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
);
export const CapIcon = () => (
  <Svg><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5" /></Svg>
);
export const BarsIcon = () => (
  <Svg><path d="M5 20v-8M12 20V5M19 20v-9" /></Svg>
);
export const EyeIcon = () => (
  <Svg><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const EyeOffIcon = () => (
  <Svg><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></Svg>
);
export const SunIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);
export const MoonIcon = () => (
  <Svg><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Svg>
);

export const HomeIcon = () => (<Svg><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Svg>);
export const BooksIcon = () => (<Svg><path d="M3 5.5C5 4 8 4 12 6c4-2 7-2 9-.5V19c-2-1.5-5-1.5-9 .5-4-2-7-2-9-.5z" /><path d="M12 6v13.5" /></Svg>);
export const UsersIcon = () => (<Svg><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></Svg>);
export const BellIcon = () => (<Svg><path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z" /><path d="M10 21a2 2 0 0 0 4 0" /></Svg>);
export const CalendarIcon = () => (<Svg><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></Svg>);
export const CalculatorIcon = () => (<Svg><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8 7h8" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></Svg>);
export const GamepadIcon = () => (<Svg><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 10.5v4M5 12.5h4" /><path d="M15.5 11.5h.01M18 13.5h.01" /></Svg>);
export const WifiIcon = () => (<Svg><path d="M2 9a15 15 0 0 1 20 0" /><path d="M5.5 12.5a10 10 0 0 1 13 0" /><path d="M9 16a5 5 0 0 1 6 0" /><path d="M12 19.5h.01" /></Svg>);
export const PhoneIcon = () => (<Svg><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>);
export const WalletIcon = () => (<Svg><path d="M17 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" /><path d="M21 12v4h-4a2 2 0 0 1 0-4z" /></Svg>);
export const SearchIcon = () => (<Svg><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></Svg>);
export const ChevronIcon = () => (<Svg><path d="M9 6l6 6-6 6" /></Svg>);
export const ArrowIcon = () => (<Svg><path d="M5 12h14M13 6l6 6-6 6" /></Svg>);
export const PlusIcon = () => (<Svg><path d="M12 5v14M5 12h14" /></Svg>);
export const FileIcon = () => (<Svg><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></Svg>);
export const PencilIcon = () => (<Svg><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></Svg>);

export const ICONS = {
  books: BooksIcon, users: UsersIcon, bell: BellIcon, calendar: CalendarIcon, calculator: CalculatorIcon,
  gamepad: GamepadIcon, wifi: WifiIcon, phone: PhoneIcon, wallet: WalletIcon,
};
export const XIcon = () => (<Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>);
export const BackspaceIcon = () => (<Svg><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" /><path d="M13 10l4 4M17 10l-4 4" /></Svg>);