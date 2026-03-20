export const smsService = {
  send: async (to: string, message: string) => {
    console.log(`SMS envoyé à ${to}: ${message}`);
    return { success: true };
  }
};