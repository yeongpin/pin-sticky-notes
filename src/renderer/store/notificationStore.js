import { ElNotification } from 'element-plus';
import i18n from '../i18n'; // 需要創建這個文件

const notify = (options) => {
  const {
    title = '',
    message = '',
    type = 'info',
    duration = 3000,
    position = 'top-right',
    offset = 50,
    showClose = true,
  } = options;

  const { t } = i18n.global;

  ElNotification({
    title: t(title),
    message: t(message),
    type,
    duration,
    position,
    offset,
    showClose,
  });
};

export const useNotification = () => {
  return {
    notify,
    success: (messageKey, titleKey = 'notification.success') => 
      notify({ type: 'success', message: messageKey, title: titleKey }),
    error: (messageKey, titleKey = 'notification.error') => 
      notify({ type: 'error', message: messageKey, title: titleKey }),
    warning: (messageKey, titleKey = 'notification.warning') => 
      notify({ type: 'warning', message: messageKey, title: titleKey }),
    info: (messageKey, titleKey = 'notification.info') => 
      notify({ type: 'info', message: messageKey, title: titleKey }),
  };
}; 