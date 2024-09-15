import Navigo from "navigo"
import { app_mode } from "@js/util"

export const router = new Navigo("/", { hash: app_mode !== "static_render" })

window.go_to_href = href => router.navigate(href)
