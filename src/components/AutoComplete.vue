<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  search: {
    type: Function,
    required: true,
  },
  itemText: {
    type: String,
    default: "nome",
  },
  placeholder: {
    type: String,
    default: "Digite para pesquisar",
  },
  initialText: {
    type: String,
    default: "",
  },
});

const handleKeyDown = (event) => {
  if (!searching.value) return;

  const items = Object.values(props.items);
  const totalItems = items.length;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedItemIndex.value = (selectedItemIndex.value + 1) % totalItems;
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedItemIndex.value = (selectedItemIndex.value - 1 + totalItems) % totalItems;
      break;
    case "Enter":
      if (selectedItemIndex.value >= 0) {
        const selectedItem = items[selectedItemIndex.value];
        selectItem(selectedItem);
      }
      break;
    case "Escape":
      searching.value = false;
      selectedItemIndex.value = -1;
      break;
  }
};

const model = defineModel();
const value = ref(props.initialText || "");

watch(() => props.initialText, (newText) => {
  if (newText) value.value = newText;
});

const searching = ref(false);
const timer = ref(null);

const selectItem = (item) => {
  model.value = item.id;
  value.value = item[props.itemText];
  searching.value = false;
};

const filterItems = (event) => {
  const searchTerm = event.target.value;
  value.value = searchTerm;
  clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    props.search(searchTerm);
  }, 500);
};

const selectedItemIndex = ref(-1);

onBeforeUnmount(() => {
  clearTimeout(timer.value);
});

const openSearch = () => {
  searching.value = true;
};
</script>
<template>
  <div @keydown="handleKeyDown">
    <div class="autocomplete">
      <input
        class="input"
        @input="filterItems"
        :value="value"
        type="text"
        :placeholder="props.placeholder"
        @focus="openSearch"
      />
      <ul v-show="searching" class="autocomplete-list">
        <li
          v-for="(item, index) in props.items"
          :key="item.id"
          @click="selectItem(item)"
          :class="{ active: selectedItemIndex === index }"
          tabindex="0"
        >
          {{ item[props.itemText] }}
        </li>
      </ul>
    </div>
  </div>
</template>
