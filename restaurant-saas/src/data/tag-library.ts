/**
 * tag-library.ts - Pre-set tag library for douyin hashtag lookup
 */
export interface CityTagGroup {
  city: string;
  hotTags: string[];
  regionTags: string[];
  cuisineTags: Record<string, string[]>;
}

const CITY_TAGS: Record<string, CityTagGroup> = {
  beijing: { city: "北京", hotTags: ["#北京美食","#北京探店","#帝都美食"], regionTags: ["#三里屯美食","#望京美食"], cuisineTags: { "火锅": ["#北京火锅","#铜锅洦肉"], "川菜": ["#北京川菜"], "烧烤": ["#北京烧烤"] } },
  shanghai: { city: "上海", hotTags: ["#上海美食","#上海探店","#魔都美食"], regionTags: ["#静安寺美食","#新天地美食"], cuisineTags: { "火锅": ["#上海火锅"], "本邦菜": ["#本邦菜","#上海菜"], "咖啡": ["#上海咖啡"] } },
  chengdu: { city: "成都", hotTags: ["#成都美食","#成都探店","#成都必吃"], regionTags: ["#春熙路美食","#太古里美食"], cuisineTags: { "火锅": ["#成都火锅","#老火锅"], "川菜": ["#成都川菜"], "串串": ["#成都串串"] } },
};

export function getCityTags(city: string): CityTagGroup | null {
  for (const g of Object.values(CITY_TAGS)) {
    if (g.city === city) return g;
  }
  return null;
}
export function getCuisineTags(cuisine: string): string[] { return CITY_TAGS[cuisine]?.[cuisine] || []; }
export function getHotTags(cityName?: string): string[] {
  if (cityName) { const g = getCityTags(cityName); if (g) return g.hotTags; }
  return ["#美食探店","#本地美食","#好吃到哭"];
}
