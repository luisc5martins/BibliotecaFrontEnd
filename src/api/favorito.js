import axios from "axios";
export default class FavoritoApi {
  async buscarFavoritos(page = 1) {
    const { data } = await axios.get(`/favoritos/?page=${page}`);
    return data;
  }
  async adicionarFavorito(favorito) {
    const { data } = await axios.post("/favoritos/", favorito);
    return data;
  }
  async atualizarFavorito(id, favorito) {
    const { data } = await axios.patch(`/favoritos/${id}/`, favorito);
    return data;
  }
  async excluirFavorito(id) {
    await axios.delete(`/favoritos/${id}/`);
  }
  async buscarEstatisticas() {
    const { data } = await axios.get("/favoritos/livros_com_estatisticas/");
    return data;
  }
}
