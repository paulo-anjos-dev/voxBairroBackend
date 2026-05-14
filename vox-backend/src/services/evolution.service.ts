import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export class EvolutionService {
  private static api = axios.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
      'apikey': EVOLUTION_API_KEY
    }
  });

  /**
   * Cria uma nova instância na Evolution API
   */
  static async createInstance(instanceName: string) {
    try {
      const response = await this.api.post('/instance/create', {
        instanceName,
        token: EVOLUTION_API_KEY
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
      }
      console.error(`Erro ao criar instância ${instanceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém o QR Code de uma instância
   */
  static async getQrCode(instanceName: string) {
    try {
      const response = await this.api.get(`/instance/connect/${instanceName}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar QR Code para ${instanceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista todas as instâncias
   */
  static async listInstances() {
    try {
      const response = await this.api.get('/instance/fetchInstances');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar instâncias:', error.message);
      throw error;
    }
  }

  /**
   * Busca informações de um grupo
   */
  static async getGroupInfo(instanceName: string, groupJid: string) {
    try {
      const response = await this.api.get(`/group/findGroupInfos/${instanceName}?groupJid=${groupJid}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar info do grupo ${groupJid}:`, error.message);
      throw error;
    }
  }
}
