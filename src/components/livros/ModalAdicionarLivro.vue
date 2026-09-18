<script setup>
import { reactive, onMounted, ref, watch } from "vue";
import AutoComplete from "@/components/AutoComplete.vue";
import { useCategoriaStore } from "@/stores/categoria";
import { useEditoraStore } from "@/stores/editora";
import { useLivroStore } from "@/stores/livro";
import { useAutorStore } from "@/stores/autor";
import UploadApi from "@/api/upload";
import { useToastStore } from "@/stores/toast";

const uploadApi = new UploadApi();
const categoriaStore = useCategoriaStore();
const editoraStore = useEditoraStore();
const livroStore = useLivroStore();
const autorStore = useAutorStore();
const toast = useToastStore();

const props = defineProps({
  livroParaEditar: { type: Object, default: null },
});
const emit = defineEmits(["close", "salvo"]);

const defaultLivro = {
  id: null,
  titulo: "",
  isbn: "",
  quantidade: 0,
  preco: 0,
  categoria: "",
  editora: "",
  autores: [],
  capa_attachment_key: "",
};
const livro = reactive({ ...defaultLivro });
const imagePreview = ref(null);
const imageFile = ref(null);
const autorSelecionado = ref(null);
const autoresSelecionados = ref([]);
const categoriaTexto = ref('');
const editoraTexto = ref('');

watch(
  () => props.livroParaEditar,
  (val) => {
    if (val) {
      livro.id = val.id;
      livro.titulo = val.titulo || "";
      livro.isbn = val.isbn || "";
      livro.quantidade = val.quantidade || 0;
      livro.preco = val.preco || 0;
      livro.categoria = val.categoria?.id || val.categoria || "";
      livro.editora = val.editora?.id || val.editora || "";
      categoriaTexto.value = val.categoria?.descricao || '';
      editoraTexto.value = val.editora?.nome || '';
      livro.autores = val.autores
        ? val.autores.map((a) => (typeof a === "object" ? a.id : a))
        : [];
      autoresSelecionados.value = val.autores
        ? val.autores.map((a) => (typeof a === "object" ? a : { id: a, nome: `Autor ${a}` }))
        : [];
      livro.capa_attachment_key = "";
      if (val.capa && val.capa.url) {
        imagePreview.value = val.capa.url;
      }
    }
  },
  { immediate: true }
);

const fileInputRef = ref(null);

function openSelectImage() {
  fileInputRef.value?.click();
}

function selectImage(evt) {
  const file = evt.target.files[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function limpar() {
  Object.assign(livro, { ...defaultLivro });
  imagePreview.value = null;
  imageFile.value = null;
  autoresSelecionados.value = [];
  autorSelecionado.value = null;
  categoriaTexto.value = '';
  editoraTexto.value = '';
}

function adicionarAutor(autorId) {
  if (!autorId) return;
  if (livro.autores.includes(autorId)) return;
  const autor = autorStore.autores.find((a) => a.id === autorId);
  if (autor) {
    livro.autores.push(autorId);
    autoresSelecionados.value.push(autor);
  }
  autorSelecionado.value = null;
}

function removerAutor(autorId) {
  livro.autores = livro.autores.filter((id) => id !== autorId);
  autoresSelecionados.value = autoresSelecionados.value.filter((a) => a.id !== autorId);
}

async function salvar() {
  try {
    if (imageFile.value) {
      const uploaded = await uploadApi.uploadImagem(imageFile.value);
      livro.capa_attachment_key = uploaded.attachment_key;
    }

    const payload = {
      titulo: livro.titulo,
      isbn: livro.isbn,
      quantidade: livro.quantidade,
      preco: livro.preco,
      categoria: livro.categoria || null,
      editora: livro.editora || null,
      autores: livro.autores,
    };
    if (livro.capa_attachment_key) {
      payload.capa_attachment_key = livro.capa_attachment_key;
    }
    if (livro.id) {
      payload.id = livro.id;
    }

    await livroStore.salvarLivro(payload);
    limpar();
    emit("salvo");
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao salvar livro.', 'error');
  }
}

onMounted(() => {
  categoriaStore.getCategorias();
  editoraStore.getEditoras();
  autorStore.getAutores();
});
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">{{ livro.id ? 'Editar' : 'Adicionar' }} Livro</h2>
      <div class="modal-body">
        <div class="modal-form">
          <div class="form-row">
            <div class="form-group" style="flex: 2">
              <label class="label">Título</label>
              <input class="input" type="text" v-model="livro.titulo" placeholder="Título" />
            </div>
            <div class="form-group" style="flex: 1">
              <label class="label">Categoria</label>
              <auto-complete
                v-model="livro.categoria"
                :items="categoriaStore.categorias"
                :search="categoriaStore.search"
                item-text="descricao"
                placeholder="Categoria"
                :initial-text="categoriaTexto"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex: 1">
              <label class="label">Editora</label>
              <auto-complete
                v-model="livro.editora"
                :items="editoraStore.editoras"
                :search="editoraStore.search"
                item-text="nome"
                placeholder="Editora"
                :initial-text="editoraTexto"
              />
            </div>
            <div class="form-group" style="flex: 1.5">
              <label class="label">ISBN</label>
              <input class="input" type="text" v-model="livro.isbn" placeholder="ISBN" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="label">Quantidade</label>
              <input class="input" type="number" v-model.number="livro.quantidade" placeholder="Quantidade" min="0" />
            </div>
            <div class="form-group">
              <label class="label">Preço</label>
              <input class="input" type="number" v-model.number="livro.preco" placeholder="Preço" step="0.01" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex: 2">
              <label class="label">Autores</label>
              <auto-complete
                v-model="autorSelecionado"
                :items="autorStore.autores"
                :search="autorStore.search"
                item-text="nome"
                placeholder="Adicionar autor"
                @update:model-value="adicionarAutor"
              />
              <div class="chips" v-if="autoresSelecionados.length">
                <span class="chip" v-for="a in autoresSelecionados" :key="a.id">
                  {{ a.nome }}
                  <button type="button" class="chip-remove" @click="removerAutor(a.id)">&times;</button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-sidebar">
          <div @click="openSelectImage" class="image-preview-wrapper">
            <img
              class="image-preview"
              :src="imagePreview || 'https://placehold.co/100x150?text=?'"
              alt="Capa do Livro"
            />
          </div>
          <input ref="fileInputRef" type="file" hidden @input="selectImage" accept="image/jpeg,image/png" />
          <div class="modal-actions">
            <button class="btn" @click="salvar">Salvar</button>
            <button class="btn btn-outline" @click="limpar">Limpar</button>
            <button class="btn btn-ghost" @click="$emit('close')">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-body {
  display: flex;
  gap: 1.5rem;
}
.modal-form {
  flex: 1;
}
.modal-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.image-preview-wrapper {
  cursor: pointer;
}
.image-preview {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
@media (max-width: 640px) {
  .modal-body {
    flex-direction: column;
  }
}
</style>
