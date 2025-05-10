export interface ILoginPayload {
  email: string;
  password: string;
  user_type_id?: string; // İsteğe bağlı alan - kullanıcı tipi kontrolü için
}
