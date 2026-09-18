import axios from "axios";
export default class CompraApi {
  async buscarCompras(page = 1) {
    const { data } = await axios.get(`/compras/?page=${page}`);
    return data;
  }
  async buscarCompra(id) {
    const { data } = await axios.get(`/compras/${id}/`);
    return data;
  }
  async criarCompra(itens) {
    const { data } = await axios.post("/compras/", { itens });
    return data;
  }
  async atualizarCompra(id, itens) {
    const { data } = await axios.put(`/compras/${id}/`, { itens });
    return data;
  }
  async finalizarCompra(id) {
    const { data } = await axios.post(`/compras/${id}/finalizar/`);
    return data;
  }
  async adicionarAoCarrinho(livroId, quantidade = 1) {
    const { data } = await axios.post("/compras/adicionar_ao_carrinho/", {
      livro_id: livroId,
      quantidade,
    });
    return data;
  }
  async relatorioVendasMes() {
    const { data } = await axios.get("/compras/relatorio_vendas_mes/");
    return data;
  }
}
