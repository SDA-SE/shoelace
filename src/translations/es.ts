import { registerTranslation } from '../utilities/localize';
import type { Translation } from '../utilities/localize';

const translation: Translation = {
  $code: 'es',
  $name: 'Español',
  $dir: 'ltr',

  browseFiles: '',
  clearEntry: 'Borrar entrada',
  close: 'Cerrar',
  copy: 'Copiar',
  currentValue: 'Valor actual',
  dragDrop: '',
  fileSizeExceeded: '',
  fileTypeNotAccepted: '',
  hidePassword: 'Ocultar contraseña',
  loading: 'Cargando',
  maxFiles: '',
  noMultipleFiles: '',
  progress: 'Progreso',
  remove: 'Eliminar',
  resize: 'Cambiar el tamaño',
  scrollToEnd: 'Desplazarse hasta el final',
  scrollToStart: 'Desplazarse al inicio',
  selectAColorFromTheScreen: 'Seleccione un color de la pantalla',
  serverError: '',
  showPassword: 'Mostrar contraseña',
  toggleColorFormat: 'Alternar formato de color',
  transferAbort: '',
  transferError: ''
};

registerTranslation(translation);

export default translation;
