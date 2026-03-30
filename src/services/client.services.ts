import Client from '@database/models/client';

class ClientServices {
  static async createClient(name: string, phone: string, isMember: boolean) {
    const client = await Client.create({ name, phone, isMember });

    return client;
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

export default ClientServices;
