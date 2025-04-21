import axios from "axios"

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "WAKATIME_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const wakatimeRes = await axios.get(
      "https://wakatime.com/api/v1/users/neverchangebrain/stats",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
        },
      },
    )

    return new Response(JSON.stringify(wakatimeRes.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    const status = error?.response?.status || 500
    const message =
      error?.response?.data?.error || "Failed to fetch WakaTime stats"
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
