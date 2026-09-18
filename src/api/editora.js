import axios from "axios";
export default class EditoraApi {
  async buscarTodasAsEditoras(page, search = "") {
    const { data } = await axios.get(`/editoras/?page=${page}&search=${search}`);
    return data;
  }
  async adicionarEditora(editora) {
    const { data } = await axios.post("/editoras/", editora);
    return data;
  }
  async atualizarEditora(editora) {
    const { data } = await axios.put(`/editoras/${editora.id}/`, editora);
    return data;
  }
  async excluirEditora(id) {
    await axios.delete(`/editoras/${id}/`);
  }
}
