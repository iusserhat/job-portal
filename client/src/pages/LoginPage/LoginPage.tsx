// Dosya içeriği çok farklı olabilir, bu durumda LocalStorage'ye alternatif bir çözüm uygulanmalıdır.
// Temel mantık:
// 1. Login olduğunda localStorage'a kaydetmeye çalış
// 2. Eğer localStorage erişimi başarısız olursa, URL parametre veya session storage gibi alternatif çözümler kullan

// Örnek olarak aşağıdaki gibi bir yöntem eklenebilir:
// Login işleminden sonra:

// Token alındıktan sonra
try {
  // Önce localStorage'a kaydetmeyi dene
  localStorage.setItem("access_token", token);
} catch (storageError) {
  console.error("LocalStorage erişim hatası:", storageError);
  // URL parametre alternatifi kullan - Netlify uygulaması için
  // Bu token'ı sadece geçerli tarayıcı oturumu için kullanacağız
  window.location.href = `/my-jobs?token=${encodeURIComponent(token)}`;
}

// Sonra MyJobsPage içinde:
// const token = localStorage.getItem('access_token') || new URLSearchParams(window.location.search).get('token'); 