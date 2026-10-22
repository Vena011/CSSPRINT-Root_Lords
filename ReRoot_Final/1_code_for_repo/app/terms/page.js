import InfoPage from "@/components/InfoPage";

export const metadata = { title: "Terms · ReRoot" };

const S = [
  ["About ReRoot", "ReRoot is a free prototype made for CSSprint 2026. It connects food vendors near UST with students who want to buy their extra dishes. ReRoot does not sell, cook or deliver food."],
  ["For students", "A reservation holds servings for you until the vendor's cutoff time. Pay the vendor in cash at pickup. Please cancel in the app if you can't come, so the food doesn't go to waste."],
  ["For vendors", "Post only food you prepared the same day and that is safe to eat. You are responsible for its quality, price and handling. Keep your listing accurate and close it when you run out."],
  ["Fair use", "Don't make fake reservations or listings, use someone else's account, or try to break the app. We may remove accounts or listings that do."],
  ["No warranty", "The prototype is provided as is. It may have bugs, and features may change or stop during and after the event."],
  ["Contact", "See Help for how to reach Team Root Lords."],
];

export default function Terms() {
  return <InfoPage title="Terms and Conditions" updated="Last updated: October 23, 2026" sections={S} />;
}
