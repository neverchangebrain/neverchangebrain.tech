import "@/lib/config"
import { drizzle } from "drizzle-orm/xata-http"
import { getXataClient } from "./xata"

export const db = drizzle(getXataClient())
