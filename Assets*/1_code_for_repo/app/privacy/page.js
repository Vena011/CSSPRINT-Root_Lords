import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Privacy Policy · ReRoot" };

const S = [
  ["Summary", "We collect only what ReRoot needs to connect you with nearby vendors, we never sell it, and you can ask us to delete it anytime. We follow the Philippine Data Privacy Act of 2012 (Republic Act No. 10173)."],
  ["What we collect", [
    "Account: your email address. Your password is handled by Firebase Authentication; we never see or store it.",
    "Students: the first name and dorm you enter, and your reservations (dish, servings, pickup code, status).",
    "Vendors: your store name, street or landmark, the stall location you set, and your listings and orders.",
    "Location: your phone's location is used in your browser to sort dishes by distance. It is saved only if you turn on notifications, as an approximate point with your chosen radius.",
    "Notifications: if you turn them on, a push token so we can alert you about nearby dishes.",
  ]],
  ["How we use it", "To show nearby dishes, process reservations, let a vendor see who is picking up (name, dorm, servings, code), send the notifications you asked for, and show vendors their own results."],
  ["Where it is stored", "In Google Firebase (Cloud Firestore, Singapore region). Access is limited by security rules: students can only read their own reservations, and vendors only the orders for their own listings."],
  ["Sharing", "We don't sell or share your data with advertisers. A vendor sees only the details needed for your pickup."],
  ["How long we keep it", "ReRoot is a hackathon prototype. Demo data is deleted after CSSprint 2026 judging, and any account can be deleted earlier on request."],
  ["Your rights", "You can ask to see, correct or delete your data, or withdraw consent, by contacting us (see Help). You can edit your name and dorm anytime in Account."],
];

export default function Privacy() {
  return <InfoPage title="Privacy Policy" updated="Last updated: October 23, 2026" sections={S} />;
}
