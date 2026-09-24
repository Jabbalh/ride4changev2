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
        <button type="button" title="Insérer un tableau (3 × 3, avec ligne d'en-tête)" :disabled="editor.isActive('table')"
                @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">▦</button>
      </div>

      <!-- Image sélectionnée : taille (sinon, poignées aux coins) et position par rapport au texte -->
      <template v-if="editor.isActive('image')">
        <div class="group">
          <button
              v-for="s in IMAGE_SIZES" :key="s.label"
              type="button" :class="{ active: imageWidth === s.width }" :title="s.title"
              @click="setImageWidth(s.width)"
          >{{ s.label }}</button>
        </div>
        <div class="group">
          <button
              v-for="a in IMAGE_ALIGNS" :key="a.label"
              type="button" :class="{ active: imageAlign === a.value }" :title="a.title"
              @click="setImageAlign(a.value)"
          >{{ a.label }}</button>
        </div>
      </template>

      <!-- Curseur dans un tableau : lignes, colonnes, en-tête -->
      <div v-if="editor.isActive('table')" class="group table-tools">
        <button type="button" title="Ajouter une ligne en dessous" @click="editor.chain().focus().addRowAfter().run()">+ Ligne</button>
        <button type="button" title="Ajouter une colonne à droite" @click="editor.chain().focus().addColumnAfter().run()">+ Col.</button>
        <button type="button" title="Supprimer la ligne" @click="editor.chain().focus().deleteRow().run()">− Ligne</button>
        <button type="button" title="Supprimer la colonne" @click="editor.chain().focus().deleteColumn().run()">− Col.</button>
        <button type="button" title="Ligne d'en-tête (première ligne en titre)" @click="editor.chain().focus().toggleHeaderRow().run()">En-tête</button>
        <button type="button" title="Fusionner ou séparer les cellules sélectionnées" :disabled="!editor.can().mergeOrSplit()" @click="editor.chain().focus().mergeOrSplit().run()">Fusion</button>
        <button type="button" class="danger" title="Supprimer le tableau" @click="editor.chain().focus().deleteTable().run()">✕ Tableau</button>
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
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { TableKit } from '@tiptap/extension-table'
import { renderRichText } from '@/lib/richText'
import { ImageUploadError, uploadEventImage } from '@/lib/eventImages'

// Le rendu redimensionnable de Tiptap n'applique la largeur qu'à la création de l'image.
// On la réapplique à chaque mise à jour du nœud, pour que les tailles rapides (updateAttributes) s'affichent.
const ResizableImage = Image.extend({
  // Alignement : image à gauche ou à droite, entourée par le texte (data-align, voir article.css)
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: el => {
          const v = el.getAttribute('data-align')
          return v === 'left' || v === 'right' ? v : null
        },
        renderHTML: attrs => (attrs.align ? { 'data-align': attrs.align } : {}),
      },
    }
  },
  addNodeView() {
    const createView = this.parent?.()
    if (!createView) return null
    return props => {
      const view = createView(props)
      const img = view.dom instanceof HTMLElement ? view.dom.querySelector('img') : null
      const originalUpdate = view.update?.bind(view)
      view.update = (node, ...rest) => {
        const handled = originalUpdate ? originalUpdate(node, ...rest) : false
        if (handled && img) {
          img.style.width = node.attrs.width ? `${node.attrs.width}px` : ''
          img.style.height = node.attrs.height ? `${node.attrs.height}px` : ''
          if (node.attrs.align) img.setAttribute('data-align', node.attrs.align)
          else img.removeAttribute('data-align')
        }
        return handled
      }
      return view
    }
  },
})

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
    // Poignées aux 4 coins ; largeur/hauteur enregistrées en attributs width/height (proportions conservées)
    ResizableImage.configure({
      resize: {
        enabled: true,
        directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    // Largeur des colonnes non réglable : elle serait stockée en style inline, que le filtre retire (richText.ts)
    TableKit.configure({ table: { resizable: false } }),
  ],
  editorProps: {
    attributes: { class: 'article-content editor-surface' },
    // Images collées ou glissées : même envoi contrôlé (format, taille, réduction) que le bouton 🖼.
    // Sans ça, le navigateur pourrait ouvrir le fichier déposé à la place de la page (article perdu).
    handlePaste: (_view, event) => {
      const files = imageFiles(event.clipboardData?.files)
      if (!files.length) return false
      files.forEach(file => insertImageFile(file))
      return true
    },
    handleDrop: (view, event, _slice, moved) => {
      if (moved) return false
      const files = imageFiles(event.dataTransfer?.files)
      if (!files.length) return false
      event.preventDefault()
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
      files.forEach(file => insertImageFile(file, pos))
      return true
    },
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

// --- Taille des images ---
// null = pleine largeur de l'article (l'image s'adapte, y compris sur mobile)
const IMAGE_SIZES = [
  { label: 'Petite', width: 240, title: 'Petite image (240 px)' },
  { label: 'Moyenne', width: 420, title: 'Image moyenne (420 px)' },
  { label: 'Pleine', width: null, title: "Pleine largeur de l'article" },
] as const

const imageWidth = computed(() => {
  const w = editor.value?.getAttributes('image').width
  return w ? Number(w) : null
})

// Position de l'image : seule sur sa ligne, ou à gauche/droite avec le texte qui l'entoure.
// Sur mobile, une image alignée repasse au-dessus du texte (article.css).
const IMAGE_ALIGNS = [
  { label: '◧ Gauche', value: 'left', title: 'Image à gauche, texte à droite' },
  { label: '▣ Seule', value: null, title: 'Image seule sur sa ligne' },
  { label: 'Droite ◨', value: 'right', title: 'Image à droite, texte à gauche' },
] as const

const imageAlign = computed(() => editor.value?.getAttributes('image').align ?? null)

function setImageAlign(align: 'left' | 'right' | null) {
  const ed = editor.value
  if (!ed) return
  // Une image pleine largeur ne laisserait pas de place au texte : on passe en taille moyenne
  const attrs: Record<string, unknown> = { align }
  if (align && !ed.getAttributes('image').width) Object.assign(attrs, { width: 320, height: null })
  ed.chain().focus().updateAttributes('image', attrs).run()
}

function setImageWidth(width: number | null) {
  // Hauteur laissée libre : le navigateur la calcule d'après les proportions de la photo
  editor.value?.chain().focus().updateAttributes('image', { width, height: null }).run()
}

// --- Images (Supabase Storage) ---
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadError = ref('')

function imageFiles(list?: FileList | null): File[] {
  return Array.from(list ?? []).filter(f => f.type.startsWith('image/'))
}

async function onFileChosen(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await insertImageFile(file)
}

/** Envoie l'image puis l'insère à la position donnée (dépôt) ou à la position du curseur. */
async function insertImageFile(file: File, pos?: number) {
  uploading.value = true
  uploadError.value = ''
  try {
    const src = await uploadEventImage(file)
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    const chain = editor.value?.chain().focus()
    if (pos === undefined) chain?.setImage({ src, alt }).run()
    else chain?.insertContentAt(pos, { type: 'image', attrs: { src, alt } }).run()
  } catch (err) {
    console.error(err)
    // Messages de uploadEventImage (format, taille…) affichés tels quels ; sinon message générique
    uploadError.value = err instanceof ImageUploadError
      ? err.message
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
/* Images redimensionnables (structure générée par Tiptap : container > wrapper > img + poignées) */
:deep(.editor-surface [data-resize-container]) { margin: 1.5rem 0; max-width: 100%; }
:deep(.editor-surface [data-resize-wrapper]) { max-width: 100%; }
/* La marge est portée par le conteneur, pour que les poignées collent aux coins de l'image */
:deep(.editor-surface [data-resize-wrapper] img) { margin: 0; max-width: 100%; height: auto !important; }
:deep(.editor-surface .ProseMirror-selectednode img) { outline: 2px solid var(--red); outline-offset: 2px; }
:deep(.editor-surface [data-resize-handle]) {
  width: 14px; height: 14px; z-index: 2;
  background: var(--red); border: 2px solid var(--white); border-radius: 50%;
  opacity: 0; transition: opacity 0.15s;
}
:deep(.editor-surface [data-resize-container]:hover [data-resize-handle]),
:deep(.editor-surface .ProseMirror-selectednode [data-resize-handle]),
:deep(.editor-surface [data-resize-state="true"] [data-resize-handle]) { opacity: 1; }
:deep(.editor-surface [data-resize-handle="top-left"]) { transform: translate(-50%, -50%); cursor: nwse-resize; }
:deep(.editor-surface [data-resize-handle="bottom-right"]) { transform: translate(50%, 50%); cursor: nwse-resize; }
:deep(.editor-surface [data-resize-handle="top-right"]) { transform: translate(50%, -50%); cursor: nesw-resize; }
:deep(.editor-surface [data-resize-handle="bottom-left"]) { transform: translate(-50%, 50%); cursor: nesw-resize; }
/* Dans l'éditeur, l'image est enveloppée par Tiptap : c'est l'enveloppe qui doit flotter (le style public vise l'img) */
:deep(.editor-surface [data-resize-container]:has(img[data-align="left"])) { float: left; max-width: 50%; margin: 0.35rem 1.5rem 1rem 0; }
:deep(.editor-surface [data-resize-container]:has(img[data-align="right"])) { float: right; max-width: 50%; margin: 0.35rem 0 1rem 1.5rem; }
:deep(.editor-surface [data-resize-container] img[data-align]) { float: none; max-width: 100%; margin: 0; }

/* Tableaux en édition : cellules sélectionnées et cellules vides bien visibles */
:deep(.editor-surface table) { margin-bottom: 1.1rem; }
:deep(.editor-surface td), :deep(.editor-surface th) { position: relative; min-width: 3rem; }
:deep(.editor-surface .selectedCell)::after { content: ''; position: absolute; inset: 0; background: rgba(230,57,70,0.18); pointer-events: none; }
:deep(.editor-surface .tableWrapper) { overflow-x: auto; }

.toolbar .table-tools button { font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; letter-spacing: 0.05em; }
.toolbar button.danger:hover { color: var(--red); }
:deep(.editor-surface a) { cursor: text; }
</style>
