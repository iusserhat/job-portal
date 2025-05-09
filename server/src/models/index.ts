// Tüm modelleri burada import ederek register edilmelerini sağlıyoruz
import JobPost from './job/job_post.model';
import JobType from './job/job_type.model';
import JobLocation from './job/job_location.model';

// Diğer modeller de buraya eklenebilir
// import User from './user/user.model';
// import Company from './company-profile/company.model';

// Tüm modelleri dışa aktarıyoruz
export {
  JobPost,
  JobType,
  JobLocation
};

// Modelleri yükleme fonksiyonu
export const loadModels = () => {
  console.log("🔄 [Server]: MongoDB modelleri yüklendi");
  return {
    JobPost,
    JobType,
    JobLocation
  };
};

export default {
  loadModels
}; 