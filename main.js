const languageButton = document.querySelector("#lang");
const languageKey = "profile-language";
const englishText = [...document.querySelectorAll("[data-en]")].map(element => ({
  element, zh: element.textContent, en: element.dataset.en
}));
const translatedAttributes = [...document.querySelectorAll("[data-en-aria], [data-en-alt]")].map(element => {
  const image = element.hasAttribute("data-en-alt");
  const attribute = image ? "alt" : "aria-label";
  return {
    element, attribute, zh: element.getAttribute(attribute),
    en: image ? element.dataset.enAlt : element.dataset.enAria
  };
});

function readLanguage() {
  const requested = new URL(location.href).searchParams.get("lang");
  if (requested === "en" || requested === "zh") return requested;
  try { return localStorage.getItem(languageKey) === "en" ? "en" : "zh"; }
  catch { return "zh"; }
}

function changeLanguage(language) {
  const english = language === "en";
  document.documentElement.lang = english ? "en" : "zh-CN";
  for (const item of englishText) item.element.textContent = item[language];
  for (const item of translatedAttributes) item.element.setAttribute(item.attribute, item[language]);
  const otherName = document.querySelector(".other-name");
  if (otherName) otherName.lang = english ? "zh-CN" : "en";
  languageButton.querySelector("span").textContent = english ? "中文" : "EN";
  languageButton.title = english ? "切换到中文" : "Switch to English";
  languageButton.setAttribute("aria-label", languageButton.title);
  // Explicit language on local links also works when file pages have separate storage.
  for (const link of document.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!/^[\w-]+\.html(?:[?#]|$)/.test(href)) continue;
    const target = new URL(href, location.href);
    const localFile = href.split(/[?#]/, 1)[0];
    target.searchParams.set("lang", language);
    link.setAttribute("href", localFile + target.search + target.hash);
  }
}

const legacyPages = { "#publications": "publications.html", "#research": "research.html" };
if (document.body.dataset.page === "index" && Object.hasOwn(legacyPages, location.hash)) {
  location.replace(legacyPages[location.hash] + location.search);
} else {
  changeLanguage(readLanguage());
  languageButton.hidden = false;
  languageButton.addEventListener("click", () => {
    const language = document.documentElement.lang === "en" ? "zh" : "en";
    try { localStorage.setItem(languageKey, language); } catch {}
    const url = new URL(location.href);
    url.searchParams.set("lang", language);
    try { history.replaceState(null, "", url); }
    catch { location.replace(url); return; }
    changeLanguage(language);
  });
}
