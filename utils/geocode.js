const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function getCoordinates(place) {
  try {
    //  STEP 1: Global search
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;

    let res = await fetch(url, {
      headers: {
        "User-Agent": "my-app (test@gmail.com)"
      }
    });

    let data = await res.json();

    // 🇮🇳 STEP 2: If no result → fallback to India
    if (data.length === 0) {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1&countrycodes=in`;

      res = await fetch(url, {
        headers: {
          "User-Agent": "wanderlust-app (joydip@example.com)"
        }
      });

      data = await res.json();
    }

    // ❌ Still no result
    if (data.length === 0) return null;

    // ✅ Return coordinates
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

  } catch (err) {
    console.error("Geocoding Error:", err);
    return null;
  }
}

module.exports = getCoordinates;