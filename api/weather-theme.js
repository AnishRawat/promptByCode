export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: "Latitude and longitude required" });
    }

    // Open-Meteo API for current weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const weatherResp = await fetch(weatherUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!weatherResp.ok) {
      throw new Error(`Weather API returned ${weatherResp.status}`);
    }

    const weatherData = await weatherResp.json();
    const current = weatherData.current_weather;

    // Determine theme based on weather and day/night
    let theme = "light";
    if (current.is_day === 0) theme = "dark"; // night
    else {
      const weatherCode = current.weathercode;
      // weathercode reference: https://open-meteo.com/en/docs#weathercode
      if ([61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) theme = "rain";
      else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) theme = "snow";
      else if ([45, 48].includes(weatherCode)) theme = "cloudy";
      else theme = "sunny"; // default day & clear
    }

    // Optional: detect country from lat/lon (very fast via geocode API)
    // let country = null;
    // try {
    //   const geoController = new AbortController();
    //   const geoTimeoutId = setTimeout(() => geoController.abort(), 3000); // 3s timeout for optional data
    //
    //   const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    //   const geoResp = await fetch(geoUrl, {
    //     headers: {
    //       "User-Agent": "PromptByCode/1.0 (anish.rawat@novoinvent.com)" // Required by Nominatim
    //     },
    //     signal: geoController.signal
    //   });
    //   clearTimeout(geoTimeoutId);
    //
    //   if (!geoResp.ok) {
    //     throw new Error(`Nominatim API returned ${geoResp.status}`);
    //   }
    //
    //   const geoData = await geoResp.json();
    //   country = geoData.address?.country || null;
    // } catch (err) {
    //   console.warn("Nominatim API failed or timed out:", err.message);
    //   country = null;
    // }

    res.status(200).json({
      success: true,
      theme,
      is_day: current.is_day,
      weatherCode: current.weathercode,
    });

  } catch (err) {
    console.error("Weather theme error:", err);
    res.status(500).json({
      success: false,
      theme: "light",
      error: err.message,
    });
  }
}
