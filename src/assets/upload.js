import axios from "axios";
export default class UploadApi {
  async uploadImagem(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axios.post("/media/images/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
}
