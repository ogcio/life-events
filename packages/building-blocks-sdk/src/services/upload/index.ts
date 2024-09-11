import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema.js";

export class Upload {
  client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.UPLOAD_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async shareFile(fileId: string, userId: string) {
    const { data, error } = await this.client.POST("/api/v1/metadata/share/", {
      body: { fileId, userId },
    });

    return { error, data: data?.data };
  }

  async removeFileSharing(fileId: string, userId: string) {
    const { error } = await this.client.DELETE("/api/v1/metadata/share/", {
      body: { fileId, userId },
    });

    return { error };
  }

  async getFile(id: string) {
    try {
      const {
        error,
        data,
        response: { headers, status },
      } = await this.client.GET("/api/v1/files/{id}", {
        params: { path: { id } },
        parseAs: "stream",
      });

      return {
        error,
        data,
        headers: Object.fromEntries(headers.entries()),
        status,
      };
    } catch (e) {
      return {
        error: e,
        data: null,
        headers: null,
        status: 500,
      };
    }
  }

  async getFilesMetadata() {
    const { error, data } = await this.client.GET("/api/v1/metadata/");
    return { error, data: data?.data };
  }

  async getFileMetadata(id: string) {
    const { data, error } = await this.client.GET("/api/v1/metadata/{id}", {
      params: { path: { id } },
    });

    return { error, data: data?.data };
  }

  async scheduleFileDeletion(id: string) {
    const { data, error } = await this.client.DELETE("/api/v1/metadata/", {
      body: { fileId: id },
    });
    return { error, data: data?.data };
  }

  async uploadFile(file?: File) {
    const { error, response, data } = await this.client.POST("/api/v1/files/", {
      body: {
        file,
      } as any,
      bodySerializer: (body: any) => {
        const formData = new FormData();
        formData.set("file", body.file);
        return formData;
      },
    });

    return { error };
  }

  async deleteFile(id: string) {
    const { error } = await this.client.DELETE("/api/v1/files/{id}", {
      params: { path: { id } },
    });

    return { error };
  }
}
