import { registerTranslation } from '../utilities/localize';
import type { Translation } from '../utilities/localize';

const translation: Translation = {
  $code: 'fa',
  $name: 'فارسی',
  $dir: 'rtl',

  browseFiles: '',
  clearEntry: 'پاک کردن ورودی',
  close: 'بستن',
  copy: 'کپی',
  currentValue: 'مقدار فعلی',
  dragDrop: '',
  fileSizeExceeded: '',
  fileTypeNotAccepted: '',
  hidePassword: 'پنهان کردن رمز',
  loading: 'بارگذاری',
  maxFiles: '',
  noMultipleFiles: '',
  progress: 'پیشرفت',
  remove: 'حذف',
  resize: 'تغییر اندازه',
  scrollToEnd: 'اسکرول به انتها',
  scrollToStart: 'اسکرول به ابتدا',
  selectAColorFromTheScreen: 'انتخاب یک رنگ از صفحه نمایش',
  serverError: '',
  showPassword: 'نمایش دادن رمز',
  toggleColorFormat: 'تغییر فرمت رنگ',
  transferAbort: '',
  transferError: ''
};

registerTranslation(translation);

export default translation;
