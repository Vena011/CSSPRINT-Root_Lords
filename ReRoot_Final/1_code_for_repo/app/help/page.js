import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Help · ReRoot" };

const S = [
  ["How does ReRoot work?", "Carinderias and food stalls near UST post the dishes they have left. You reserve from the app or from a link in your dorm group chat, then show your 4-digit pickup code at the stall and pay in cash."],
  ["Do I need an account?", "No. Students can browse and reserve as guests. An account saves your name and dorm so you don't type them every time. Vendors need an account to post dishes."],
  ["Is the food safe?", "Listings are for food cooked the same day. Each vendor sets a cutoff time, and the listing closes by itself at that time or when it sells out. If something seems off, don't buy it, and tell us."],
  ["I can't come anymore. What do I do?", "Open your pickup code (My orders) and tap Cancel reservation, so the servings go back to the vendor for someone else."],
  ["I'm a vendor. How do I start?", "Tap Log in → Sign up, choose “I'm a vendor”, add your store name and street, and stand at your stall when you set your location. Posting a dish takes about 30 seconds."],
  ["Why don't I get notifications on iPhone?", "On iPhone, web notifications only work after you add ReRoot to your Home Screen: open it in Safari, tap Share, then “Add to Home Screen”, and turn notifications on from there."],
  ["Contact", ["ReRoot is a prototype built by Team Root Lords during CSSprint 2026 (UST Computer Science Society).", "Questions, bugs or a vendor who wants to join: open an issue at github.com/Vena011/CSSPRINT-Root_Lords or find us at the CSSprint venue."]],
];

export default function Help() {
  return <InfoPage title="Help and contact" sections={S} />;
}
