# Platinum Yucatán Princess — Travel & Stay Companion

A mobile-first, offline-capable Progressive Web App (PWA) crafted for a **10-night Riviera Maya getaway (28 November – 8 December 2026)** at **Platinum Yucatán Princess Suites & Spa Resort** in Playa del Carmen, Mexico.

## Included Trip & Resort Features

- **Air Canada Flight & Transit Guide**:
  - **Outbound (28 Nov)**: `AC 811` (Lisbon `LIS` T1 → Toronto `YYZ` T1) → `AC 1812` (Toronto `YYZ` T1 → Cancún `CUN` T3), including step-by-step Toronto International-to-International transit instructions and Cancún Terminal 3 arrival tips.
  - **Return (8–9 Dec)**: `AC 1373` (Cancún `CUN` T3 → Toronto `YYZ` T1) → `AC 810` (Toronto `YYZ` T1 → Lisbon `LIS` T1).
  - **Editable Boarding Details**: Tap any flight leg to store gate, seat, or schedule updates directly on your device.
- **Travel Wallet**: Offline storage for your Air Canada PNR, resort reservation code, suite number, Canada eTA status, and Quintana Roo Visitax readiness.
- **Live "Open Right Now" Resort & Dining Directory**:
  - Covers all 6 Platinum Yucatán restaurants (*Yucatán Buffet*, *Kotatsu*, *La Bruschetta*, *Rodeo Grill*, *Aroma*, *Skylights*), swim-up pool bars, *Gelato & Coffee House*, 24h *Plaza Bar*, *Salsa Disco*, *Princess Spa & Sports Park*, and sister-resort privileges (*Grand Riviera & Grand Sunset Princess*).
  - Real-time Cancún (`EST`) open/closing status plus a time-of-day preview selector.
- **10-Night Interactive Stay Planner**: Day-by-day schedule (`28 Nov` – `8 Dec`) with checkable activities, custom event creation, evening restaurant selector, and daily notes.
- **Riviera Maya Toolkit**:
  - Pre-departure packing checklist tailored to `LIS` → `YYZ` → `CUN` (Type A/B 110V adapters, à la carte dress code, reef-safe sunscreen, eTA & Visitax).
  - Instant 4-currency converter (`MXN` ↔ `EUR` ↔ `USD` ↔ `CAD`) with 1-tap resort tipping & taxi presets.
  - Extras & tip expense tracker + tap-to-copy Mexican Spanish phrases + JSON export/import backup.

## Using Offline on Your Phone

Deploy this repository directly with **GitHub Pages** (no build step required—serve from the repository root), open the URL in Safari (iPhone) or Chrome (Android), and choose **Add to Home Screen**. The bundled Service Worker (`sw.js`) caches all pages, styles, and imagery for full offline use in airplane mode and around the resort.
