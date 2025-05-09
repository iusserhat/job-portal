export interface ILoginPayload {
  email: string;
  password: string;
  user_type_id?: string; // İşveren veya iş arayan olarak kullanıcı tipi
}
