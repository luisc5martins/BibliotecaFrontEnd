import axios from "axios";
export default class LivrosApi {
  async buscarTodosOsLivros(page = 1, search = "") {
    const { data } = await axios.get(`/livros/?page=${page}&search=${search}`);
    return data;
  }
  async buscarLivro(id) {
    const { data } = await axios.get(`/livros/${id}/`);
    return data;
  }
  async adicionarLivro(livro) {
    const { data } = await axios.post("/livros/", livro);
    return data;
  }
  async atualizarLivro(livro) {
    const { data } = await axios.put(`/livros/${livro.id}/`, livro);
    return data;
  }
  async excluirLivro(id) {
    await axios.delete(`/livros/${id}/`);
  }
  async alterarPreco(id, preco) {
    const { data } = await axios.patch(`/livros/${id}/alterar_preco/`, { preco });
    return data;
  }
  async ajustarEstoque(id, quantidade) {
    const { data } = await axios.post(`/livros/${id}/ajustar_estoque/`, { quantidade });
    return data;
  }
  async buscarMaisVendidos() {
    const { data } = await axios.get("/livros/mais_vendidos/");
    return data;
  }
  async adicionarAoCarrinho(id, quantidade = 1) {
    const { data } = await axios.post(`/livros/${id}/adicionar_ao_carrinho/`, { quantidade });
    return data;
  }
  async favoritar(id, payload) {
    const { data } = await axios.post(`/livros/${id}/favoritar/`, payload);
    return data;
  }
}
