<template>
  <div class="markdown-content">
  <pre v-if="error" class="error" v-html="error"></pre>
    <VueMarkdownIt v-else :source="markdownContent || ''" />
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueMarkdownIt } from '@f3ve/vue-markdown-it';

// En développement, les fichiers d'aide sont servis dans 'help/' car vite.co,fig.ts ne les recopient pas.
// En production ils sont copiés dans 'docs/helpFiles/', renommé pour ne pas entrer en conflit avec le 'help' du SPA..
const HELP_BASE = import.meta.env.MODE === 'development' ? 'help/' : 'helpFiles/'

export default defineComponent({
  name: "Help",
  components: {
    VueMarkdownIt
  },
  setup() {
    const markdownContent = ref('')
    const error = ref('')
    const route = useRoute()
    const router = useRouter()

    onMounted(async () => {
      let base = import.meta.env.BASE_URL;
      // Normalize base for fetch: use '/' when BASE_URL is './' or empty
      if (!base || base === './') base = '/';
      if (!base.startsWith('/')) base = '/' + base;
      if (!base.endsWith('/')) base = base + '/';
      console.log('Resolved Base for fetch:', base, 'Env Base URL:', import.meta.env.BASE_URL)
      console.log('Route query:', route.query, 'File param:', route.query?.file || route.query?.f || Object.keys(route.query)[0])

      const fileParam = route.query?.file || route.query?.f || Object.keys(route.query)[0]

      let fileName = ''
      if (typeof fileParam === 'string') {
        fileName = fileParam
      } else if (Array.isArray(fileParam) && typeof fileParam[0] === 'string') {
        fileName = fileParam[0]
      }
      if (!fileName || !fileName.endsWith('.md')) {
        error.value = 'Paramètre de fichier invalide. Seuls les fichiers .md sont autorisés.'
        return
      }
      try {
        const fetchUrl = base + HELP_BASE + fileName
        const response = await fetch(fetchUrl)
        const contentType = response.headers.get('content-type') || ''
        const text = await response.text()
        // Vérifie si le fichier est vraiment du markdown et non une page HTML d'erreur
        if (!response.ok || contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE html') || text.trim().startsWith('<html')) {
          error.value = `Le fichier\n\n\t\t<strong class=\"filename\">${fileName}</strong>\n\nest introuvable.`
          return
        }
        markdownContent.value = text
      } catch (e) {
        error.value = `Erreur lors du chargement du fichier : ${fileName}`
      }
    })

    return {
      error,
      markdownContent
    }
  },
});

</script>

<style scoped>
.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.error {
  color: red;
  font-family: inherit;
  font-size: 1.1em;
  white-space: pre-wrap;
}
.filename {
  font-weight: bold;
  font-size: 1.3em;
}
</style>
