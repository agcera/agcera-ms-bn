import Client from '@database/models/client';

class CleintServices {
  static async createClient(name: string, phone: string, isMember: boolean) {
    const cleint = await Client.create({ name, phone, isMember });

    return cleint;
  }

  // get one by phone
  static async getClientsByPhone(phone: string) {
    const client = await Client.findOne({ where: { phone } });
    return client;
  }

  static async getClients() {
    return await Client.findAll();
  }
}

export default CleintServices;
