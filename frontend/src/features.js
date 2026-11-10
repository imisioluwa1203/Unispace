// One line per feature. To add a feature: add a line here, then build its screen.
// status "live" opens `screen`; status "soon" shows a "coming soon" message.
export const FEATURES = [
  { id: "library",    name: "Library",     icon: "books",      screen: "library", status: "live" },
  { id: "community",  name: "Community",   icon: "users",      status: "soon" },
  { id: "updates",    name: "Updates",     icon: "bell",       status: "soon" },
  { id: "events",     name: "Events",      icon: "calendar",   status: "soon" },
    { id: "calculator", name: "Calculator", icon: "calculator", screen: "calculator", status: "live" },
  { id: "fun",        name: "Fun zone",    icon: "gamepad",    status: "soon" },
  { id: "data",       name: "Buy data",    icon: "wifi",       status: "soon" },
  { id: "airtime",    name: "Airtime",     icon: "phone",      status: "soon" },
  { id: "wallet",     name: "Fund wallet", icon: "wallet",     status: "soon" },
];