import autoPreprocess from "svelte-preprocess"
import autoprefixer from "autoprefixer"

export default {
  preprocess: autoPreprocess({
    postcss: {
      plugins: [autoprefixer],
    },
  }),
}
