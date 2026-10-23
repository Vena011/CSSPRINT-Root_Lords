// Demo data (Aleia's A3). One source for the fake data layer (lib/mock.js)
// and for JC's seed script (data/demo-seed.json is generated from this file).
// Names are fictional. Coordinates are approximate: verify in Google Maps before the demo.
// cutoffMin = minutes after the seed is loaded, so the demo works at any hour.

export const DEMO_VENDORS = [
  { id: "v1", name: "Aling Nena's Carinderia", email: "nena@reroot.test", address: "Dapitan St.", lat: 14.6119, lng: 120.9897 },
  { id: "v2", name: "Kuya Ben Shakes", email: "ben@reroot.test", address: "Asturias St.", lat: 14.6087, lng: 120.9912 },
  { id: "v3", name: "Lutong Bahay ni Tess", email: "tess@reroot.test", address: "P. Noval St.", lat: 14.6071, lng: 120.9871 },
  { id: "v4", name: "Kusina sa Lacson", email: "lacson@reroot.test", address: "Lacson Ave.", lat: 14.6112, lng: 120.9933 },
  { id: "v5", name: "Mang Ramon's Turo-Turo", email: "ramon@reroot.test", address: "Dapitan cor. M. dela Fuente", lat: 14.6127, lng: 120.9918 },
];

// [id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin]
export const DEMO_LISTINGS = [
  ["adobo", "v1", "Chicken Adobo", "bigger_serving", "Extra sabaw and rice, same price", 45, 12, 4, 8, 4, 120],
  ["tortang", "v1", "Tortang Talong", "lower_price", "₱10 off", 35, 6, 6, 6, 6, 180],
  ["shake", "v2", "Mango Shake", "lower_price", "₱10 off, ₱45 → ₱35", 35, 10, 3, 10, 3, 25],
  ["buko", "v2", "Buko Pandan Shake", "bigger_serving", "Large cup, same price", 40, 8, 8, 8, 8, 150],
  ["sinigang", "v3", "Pork Sinigang", "lower_price", "₱15 off before 8 PM", 60, 8, 7, 6, 5, 150],
  ["ginataan", "v3", "Ginataang Kalabasa", "lower_price", "₱10 off", 40, 6, 5, 6, 5, 165],
  ["menudo", "v4", "Pork Menudo", "bigger_serving", "Bigger serving + free rice", 55, 10, 5, 8, 6, 20],
  ["bicol", "v4", "Bicol Express", "lower_price", "₱10 off", 55, 8, 6, 8, 6, 140],
  ["curry", "v5", "Chicken Curry", "bigger_serving", "Extra potato and rice", 50, 10, 9, 8, 8, 160],
  ["pancit", "v5", "Pancit Canton", "lower_price", "₱10 off, good for 2", 40, 6, 4, 6, 4, 130],
  ["lumpia", "v5", "Lumpiang Gulay (3 pcs)", "lower_price", "₱5 off", 35, 12, 10, 12, 10, 175],
].map(([id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin]) => ({
  id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin,
}));

// Sample orders so the vendor's Orders screen isn't empty. ageMin = minutes ago.
export const DEMO_RESERVATIONS = [
  { id: "r-seed1", listingId: "adobo", vendorId: "v1", name: "Juan D.", dorm: "dapitan", qty: 2, pickupCode: "4821", status: "reserved", statusMsg: "", ageMin: 25 },
  { id: "r-seed2", listingId: "adobo", vendorId: "v1", name: "Mika R.", dorm: "dapitan", qty: 2, pickupCode: "3907", status: "claimed", statusMsg: "", ageMin: 20 },
  { id: "r-seed3", listingId: "adobo", vendorId: "v1", name: "Bea L.", dorm: "asturias", qty: 3, pickupCode: "7752", status: "reserved", statusMsg: "student:otw", ageMin: 10 },
  { id: "r-seed4", listingId: "adobo", vendorId: "v1", name: "Carlo M.", dorm: "asturias", qty: 1, pickupCode: "2240", status: "reserved", statusMsg: "", ageMin: 5 },
];

// Demo accounts (mock and seed): every vendor email above logs in as that vendor;
// student@reroot.test is a student (Juan D., Dapitan Dorm).
