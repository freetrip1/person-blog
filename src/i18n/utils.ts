// i18n 工具：语言推导、翻译取值、路径本地化
import { ui, defaultLang, type Lang } from './ui';

// 从 URL 推导当前语言（en 前缀 → en，否则 zh）
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : 'zh';
}

// 返回 t(key)，缺失键回退默认语言
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

// 路径本地化：en 加 /en 前缀（根路径特判），zh 保持原样
export function localizePath(path: string, lang: Lang): string {
  if (lang === 'en') {
    return '/en' + (path === '/' ? '' : path);
  }
  return path;
}

// 去掉语言前缀，得到「逻辑路径」（用于 LangToggle 互链与 hreflang）
export function stripLangPrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname;
}
