import db from "@db"
import default_banner from "@markdown/main/banner.md?raw"
import default_body from "@markdown/main/body.md?raw"
import default_more_info from "@markdown/main/more_info.md?raw"

export function get_about_main() {
  const banner = db.table_has_id("config", "banner")
    ? db.get_config("banner")
    : default_banner

  const body = db.table_has_id("config", "body")
    ? db.get_config("body")
    : default_body

  const more_info = db.table_has_id("config", "more_info")
    ? db.get_config("more_info")
    : default_more_info

  return banner + "\n" + body + "\n\n" + more_info
}