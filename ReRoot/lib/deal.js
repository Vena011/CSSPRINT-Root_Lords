// Sale helpers: a listing can carry an optional regular price (originalPrice) above its sale price.
export function discount(l) {
  const o = Number(l?.originalPrice);
  const p = Number(l?.price);
  if (!o || !p || o <= p) return null;
  return { original: o, price: p, percent: Math.round(((o - p) / o) * 100) };
}

// Text for the "new deal near you" alert, used by the in-app alert and the push route.
export function dealAlertText(l, lang = "fil") {
  const d = discount(l);
  const fil = lang === "fil";
  const title = d
    ? (fil ? `Sale malapit sa iyo: ${d.percent}% off!` : `Sale near you: ${d.percent}% off!`)
    : l.dealType === "bigger_serving"
      ? (fil ? "Mas malaking serving malapit sa iyo!" : "Bigger serving near you!")
      : (fil ? "May tirang ulam malapit sa iyo!" : "Leftover ulam near you!");
  const price = d ? `₱${d.original} → ₱${d.price}` : `₱${l.price}`;
  const left = fil ? `${l.servingsLeft} na lang` : `${l.servingsLeft} left`;
  return { title, body: `${l.vendorName}: ${l.dish} ${price} · ${left}` };
}
