<template>
  <div class="rich-editor" :class="{ focused: editor?.isFocused }">
    <div v-if="editor" class="toolbar" role="toolbar" aria-label="Mise en forme">
      <div class="group">
        <button type="button" :class="{ active: editor.isActive('paragraph') }" title="Texte normal" @click="editor.chain().focus().setParagraph().run()">¶</button>
        <button type="button" :class="{ active: editor.isActive('heading', { level: 2 }) }" title="Titre" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">T1</button>
        <button type="button" :class="{ active: editor.isActive('heading', { level: 3 }) }" title="Sous-titre" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">T2</button>
      </div>
      <div class="group">
        <button type="button" :class="{ active: editor.isActive('bold') }" title="Gras (Ctrl+B)" @click="editor.chain().focus().toggleBold().run()"><strong>G</strong></button>
        <button type="button" :class="{ active: editor.isActive('italic') }" title="Italique (Ctrl+I)" @click="editor.chain().focus().toggleItalic().run()"><em>I</em></button>
        <button type="button" :class="{ active: editor.isActive('underline') }" title="Souligné (Ctrl+U)" @click="editor.chain().focus().toggleUnderline().run()"><u>S</u></button>
        <button type="button" :class="{ active: editor.isActive('strike') }" title="Barré" @click="editor.chain().focus().toggleStrike().run()"><s>B</s></button>
      </div>
      <div class="group colors">
        <button
            v-for="c in COLORS" :key="c.value"
            type="button" class="swatch" :class="{ active: editor.isActive('textStyle', { color: c.value }) }"
            :title="`Couleur : ${c.label}`" :style="{ '--swatch': c.value }"
            @click="editor.chain().focus().setColor(c.value).run()"
        ></button>
        <button type="button" title="Couleur par défaut" @click="editor.chain().focus().unsetColor().run()">⊘</button>
      </div>
      <div class="group">
        <button type="button" :class="{ active: editor.isActive({ textAlign: 'left' }) }" title="Aligner à gauche" @click="editor.chain().focus().setTextAlign('left').run()">⯇</button>
        <button type="button" :class="{ active: editor.isActive({ textAlign: 'center' }) }" title="Centrer" @click="editor.chain().focus().setTextAlign('center').run()">≡</button>
        <button type="button" :class="{ active: editor.isActive({ textAlign: 'right' }) }" title="Aligner à droite" @click="editor.chain().focus().setTextAlign('right').run()">⯈</button>
      </div>
      <div class="group">
        <button type="button" :class="{ active: editor.isActive('bulletList') }" title="Liste à puces" @click="editor.chain().focus().toggleBulletList().run()">•≡</button>
        <button type="button" :class="{ active: editor.isActive('orderedList') }" title="Liste numérotée" @click="editor.chain().focus().toggleOrderedList().run()">1≡</button>
        <button type="button" :class="{ active: editor.isActive('blockquote') }" title="Citation / encadré" @click="editor.chain().focus().toggleBlockquote().run()">❝</button>
        <button type="button" title="Séparateur" @click="editor.chain().focus().setHorizontalRule().run()">―</button>
      </div>
      <div class="group">
        <button type="button" :class="{ active: editor.isActive('link') || linkOpen }" title="Lien" @click="toggleLinkForm">🔗</button>
        <button type="button" title="Insérer une image" :disabled="uploading" @click="fileInput?.click()">{{ uploading ? '…' : '🖼' }}</button>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden @change="onFileChosen" />
      </div>
      <div class="group">
        <button type="button" title="Annuler (Ctrl+Z)" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">↶</button>
        <button type="button" title="Rétablir (Ctrl+Y)" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">↷</button>
      </div>
    </div>

    <!-- Pas de <form> : l'éditeur est lui-même dans le formulaire de l'événement -->
    <div v-if="linkOpen" class="link-form">
      <input ref="linkInput" v-model="linkUrl" type="text" placeholder="https://… ou /#/contact"
             @keydown.enter.prevent="applyLink" @keydown.esc.prevent="linkOpen = false" />
      <button type="button" class="btn btn-primary" @click="applyLink">OK</button>
      <button v-if="editor?.isActive('link')" type="button" class="btn btn-outline" @click="removeLink">Retirer le lien</button>
    </div>

    <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>

    <EditorContent :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { renderRichText } from '@/lib/richText'
import { uploadEventImage } from '@/lib/eventImages'

// v-model : HTML de l'article ('' si vide). Le contenu initial peut aussi être du Markdown (anciens articles).
const model = defineModel<string>({ required: true })

// Couleurs proposées : celles de la charte du site, lisibles sur fond sombre
const COLORS = [
  { label: 'blanc', value: '#f5f5f5' },
  { label: 'rouge', value: '#e63946' },
  { label: 'orange', value: '#f4a261' },
  { label: 'gris', value: '#888888' },
]

let lastEmitted = model.value

const editor = useEditor({
  // Contenu existant nettoyé (et Markdown converti) par le même filtre que la page publique
  content: model.value ? renderRichText(model.value) : '',
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      code: false,
      codeBlock: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Image,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
  ],
  editorProps: {
    attributes: { class: 'article-content editor-surface' },
  },
  onUpdate: ({ editor }) => {
    // Un éditeur vide produit « <p></p> » : on enregistre '' pour que has_details reste faux
    lastEmitted = editor.isEmpty ? '' : editor.getHTML()
    model.value = lastEmitted
  },
})

// Contenu remplacé de l'extérieur (ex : passage d'un événement à un autre)
watch(model, value => {
  if (!editor.value || value === lastEmitted) return
  lastEmitted = value
  editor.value.commands.setContent(value ? renderRichText(value) : '', { emitUpdate: false })
})

onBeforeUnmount(() => editor.value?.destroy())

// --- Liens ---
const linkOpen = ref(false)
const linkUrl = ref('')
const linkInput = ref<HTMLInputElement>()

async function toggleLinkForm() {
  linkOpen.value = !linkOpen.value
  if (!linkOpen.value) return
  linkUrl.value = editor.value?.getAttributes('link').href ?? ''
  await nextTick()
  linkInput.value?.focus()
}

function applyLink() {
  let href = linkUrl.value.trim()
  if (!href) return removeLink()
  // Liens internes (/#/…) et e-mails gardés tels quels ; sinon https:// par défaut
  if (!/^(https?:\/\/|mailto:|\/)/i.test(href)) href = `https://${href}`
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href }).run()
  linkOpen.value = false
}

function removeLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  linkOpen.value = false
}

// --- Images (Supabase Storage) ---
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadError = ref('')

async function onFileChosen(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  try {
    const src = await uploadEventImage(file)
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    editor.value?.chain().focus().setImage({ src, alt }).run()
  } catch (err) {
    console.error(err)
    const status = (err as { statusCode?: string | number })?.statusCode
    uploadError.value = err instanceof Error && err.message.startsWith('Format')
      ? err.message
      : String(status) === '413'
        ? 'Image trop lourde (5 Mo maximum).'
        : "L'envoi de l'image a échoué. Vérifiez que vous êtes connecté avec un compte éditeur."
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.rich-editor { border: 1px solid rgba(255,255,255,0.1); background: var(--dark2); transition: border-color 0.3s; }
.rich-editor.focused { border-color: var(--red); }

.toolbar {
  display: flex; flex-wrap: wrap; gap: 0.35rem;
  padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: var(--dark);
  position: sticky; top: 4.5rem; z-index: 5;
}
.group { display: flex; gap: 2px; padding-right: 0.35rem; border-right: 1px solid rgba(255,255,255,0.08); }
.group:last-child { border-right: none; }
.toolbar button {
  min-width: 2rem; height: 2rem; padding: 0 0.45rem;
  background: none; border: 1px solid transparent; color: var(--grey-light); cursor: pointer;
  font-family: 'Barlow', sans-serif; font-size: 0.9rem; line-height: 1;
}
.toolbar button:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: var(--white); }
.toolbar button.active { background: rgba(230,57,70,0.2); border-color: rgba(230,57,70,0.5); color: var(--white); }
.toolbar button:disabled { opacity: 0.35; cursor: default; }
.toolbar .swatch { min-width: 1.5rem; width: 1.5rem; padding: 0; position: relative; }
.toolbar .swatch::after { content: ''; position: absolute; inset: 0.35rem; background: var(--swatch); border-radius: 50%; }

.link-form { display: flex; gap: 0.5rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; }
.link-form input {
  flex: 1; min-width: 12rem; background: var(--black); border: 1px solid rgba(255,255,255,0.15);
  color: var(--white); padding: 0.45rem 0.75rem; font-size: 0.9rem; outline: none;
}
.link-form .btn { padding: 0.45rem 1rem; font-size: 0.8rem; }
.upload-error { padding: 0.5rem 0.75rem; font-size: 0.85rem; background: rgba(230,57,70,0.1); border-bottom: 1px solid rgba(230,57,70,0.3); }

/* Zone d'édition : mêmes styles que l'article publié (src/assets/article.css) */
:deep(.editor-surface) { min-height: 16rem; padding: 1.25rem 1.5rem; outline: none; }
:deep(.editor-surface img.ProseMirror-selectednode) { outline: 2px solid var(--red); outline-offset: 2px; }
:deep(.editor-surface a) { cursor: text; }
</style>
