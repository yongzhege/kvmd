// i18n初始化
document.addEventListener('DOMContentLoaded', function() {
  // 添加调试信息
  console.log('正在初始化i18next...');
  
  // 获取当前基础URL路径
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  console.log('基础路径:', basePath);
  
  i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      debug: true, // 启用调试模式
      backend: {
        loadPath: basePath + 'locales/{{lng}}.json'
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie']
      },
      interpolation: {
        escapeValue: false
      }
    }, function(err, t) {
      // 添加调试信息
      if (err) {
        console.error('i18next初始化错误:', err);
      } else {
        console.log('i18next初始化成功，当前语言:', i18next.language);
      }
      
      // 初始化完成后更新页面上的所有i18n元素
      updateContent();
      
      // 设置语言选择器的当前值
      const langSelect = document.getElementById('language-select');
      if (langSelect) {
        langSelect.value = i18next.language;
      }
      
      // 触发自定义事件，通知i18next已初始化完成
      const event = new CustomEvent('i18nextInitialized');
      document.dispatchEvent(event);
    });
});

// 更新页面内容的函数
function updateContent() {
  // 更新HTML的lang属性
  document.documentElement.lang = i18next.language;
  
  // 查找所有带有data-i18n属性的元素
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18next.t(key);
  });
  
  // 查找所有带有data-i18n-placeholder属性的输入元素
  const inputs = document.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach(input => {
    const key = input.getAttribute('data-i18n-placeholder');
    input.placeholder = i18next.t(key);
  });
}

// 语言切换函数 - 定义为全局函数以便在HTML中调用
window.changeLanguage = function(lng) {
  console.log('切换语言到:', lng);
  
  if (!i18next) {
    console.error('i18next未初始化，无法切换语言');
    return;
  }
  
  i18next.changeLanguage(lng).then(() => {
    console.log('语言已切换到:', i18next.language);
    console.log('当前标题翻译:', i18next.t('index.title'));
    
    updateContent();
    
    // 保存语言选择到localStorage
    localStorage.setItem('i18nextLng', lng);
  }).catch(error => {
    console.error('切换语言时出错:', error);
  });
} 