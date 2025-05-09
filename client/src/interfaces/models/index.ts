export * from "./auth";
export * from "./user-account";

// Kullanıcı hesabı arabirimi
export interface IUserAccount {
  _id: string;
  user_type_id: string;
  email: string;
  password?: string;
  sms_notification_active?: boolean;
  email_notification_active?: boolean;
  registration_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string; // ID özelliği uyumluluk için eklendi
}

// Giriş için gerekli veriler
export interface ILoginPayload {
  email: string;
  password: string;
}

// Giriş yanıtı
export interface ILoginResponse {
  token: string;
  user: IUserAccount;
}

// Kayıt için gerekli veriler
export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type_id: string;
}
