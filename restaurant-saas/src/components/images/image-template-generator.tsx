import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Sparkles, Download, Save, RotateCcw, ZoomIn,
  Check, X, ImagePlus, Info,
} from 'lucide-react';

/* ---------------------------------------------------------
   设计 token（内联样式承载，Tailwind 仅负责结构/间距/排版尺寸）
--------------------------------------------------------- */
const T = {
  stage: '#131211',      // 画布台面（近黑，带暖棕调）
  panelBg: '#211D19',    // 工单面板背景
  workBg: '#17140F',     // 页面底色
  card: '#2A251F',       // 卡片/输入框背景
  border: '#3A342C',     // 分隔线
  textPrimary: '#F2EDE4',
  textSecondary: '#A79C8C',
  textFaint: '#6E6459',
  accentDefault: '#E8A33D', // 姜黄，品牌色
  danger: '#C1604A',
  success: '#7A9B76',
};

const MONO = '"SF Mono", "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const SANS = '"PingFang SC", "Microsoft YaHei", -apple-system, sans-serif';
const HAND = '"Xingkai SC", "STKaiti", cursive';

const VERSIONS = [
  { id: 'white-frame', group: '强调主体', name: '白框', desc: '单品展示，突出菜品' },
  { id: 'round-border', group: '强调主体', name: '圆角边框', desc: '温和精致，环境图/甜品' },
  { id: 'centered', group: '强调主体', name: '经典居中', desc: '万能款，容错率最高' },
  { id: 'top-bar', group: '强调信息', name: '顶部色条', desc: '促销 / 限时活动' },
  { id: 'corner-tag', group: '强调信息', name: '角标', desc: '新品 / 招牌，不遮主体' },
  { id: 'bottom-card', group: '强调信息', name: '底部卡片', desc: '价格标题，适合批量出菜单图' },
  { id: 'quote-card', group: '强调文案', name: '金句字卡', desc: '大字标语，适合发圈引流' },
  { id: 'color-block', group: '强调文案', name: '色块图案', desc: '图 + 色块拼接，适合海报' },
  { id: 'magazine', group: '强调文案', name: '杂志风', desc: '排版感强，探店测评类' },
  { id: 'polaroid', group: '强调氛围', name: '拍立得', desc: '复古边框，打卡感内容' },
  { id: 'diagonal', group: '强调氛围', name: '底部斜切', desc: '动感构图，视频封面' },
];

const COLORS = [
  { id: 'brand', name: '品牌色', hex: T.accentDefault, isBrand: true },
  { id: 'c1', name: '胭脂', hex: '#C1604A' },
  { id: 'c2', name: '抹茶', hex: '#7A9B76' },
  { id: 'c3', name: '靛蓝', hex: '#4F6D8C' },
  { id: 'c4', name: '藕粉', hex: '#D98C9A' },
  { id: 'c5', name: '栗棕', hex: '#6B4A3A' },
  { id: 'c6', name: '米白', hex: '#F2EDE4' },
  { id: 'c7', name: '墨黑', hex: '#1C1A17' },
];

const RATIOS = [
  { id: '1:1', label: '方形 1:1', ratio: '1 / 1', hint: '小红书/大众点评通用' },
  { id: '4:5', label: '竖式 4:5', ratio: '4 / 5', hint: '小红书信息流' },
  { id: '9:16', label: '限动 9:16', ratio: '9 / 16', hint: '抖音/故事页/视频封面' },
];

const TAGS = ['新品', '人气', '限定', '售完', '推荐', '招牌'];

const TAGLINE_SUGGESTIONS = ['招牌大份任性加量', '街坊吃了十年的老味道', '现炒现出锅，不等位不将就'];

const GUESS_NAMES = ['小炒黄牛肉', '青椒肉丝', '本帮红烧肉', '招牌炒饭'];

/* 判断浅底/深底该配什么文字色 */
function contrastText(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? T.workBg : T.textPrimary;
}

/* 工单撕口 zigzag SVG */
function TornEdge({ color }: { color: string }) {
  const teeth = 24;
  const w = 100 / teeth;
  let d = `M0,8`;
  for (let i = 0; i < teeth; i++) {
    const x1 = (i + 0.5) * w;
    const x2 = (i + 1) * w;
    d += ` L${x1},0 L${x2},8`;
  }
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-2 block">
      <path d={d} fill={color} />
    </svg>
  );
}

function SectionHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ fontFamily: MONO, color: T.textFaint }} className="text-xs">{n}</span>
      <span style={{ color: T.textSecondary }} className="text-xs font-semibold uppercase tracking-widest">{title}</span>
      <div className="flex-1 border-t border-dashed" style={{ borderColor: T.border }} />
    </div>
  );
}

interface Props { onGenerate?: (params: any) => void }

export default function ImageTemplateGenerator({ onGenerate }: Props) {
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [zoom, setZoom] = useState(50);

  const [ratio, setRatio] = useState('1:1');
  const [version, setVersion] = useState('bottom-card');
  const [colorId, setColorId] = useState('brand');

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [tag, setTag] = useState('招牌');
  const [price, setPrice] = useState('');

  const [beautify, setBeautify] = useState(false);
  const [exposure, setExposure] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(50);

  const [bannerOpen, setBannerOpen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [anchorImages, setAnchorImages] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const assetCount = 1; // 模拟：已保存的品牌素材数

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const accent = COLORS.find((c) => c.id === colorId)?.hex || T.accentDefault;
  const accentText = contrastText(accent);

  function handleFile(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setRecognizing(true);
      setTitle('');
      (async () => {
        try {
          const res = await fetch("/api/images/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageDataUrl: reader.result, anchorImages, platform: "dianping" }),
          });
          const data = await res.json();
          if (data.dish_name) {
            setTitle(data.dish_name);
            setAnalysisResult(data);
          } else {
            setToast("未识别到菜品");
          }
        } catch {
          setTitle(GUESS_NAMES[Math.floor(Math.random() * GUESS_NAMES.length)]);
        } finally {
          setRecognizing(false);
        }
      })();
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    setPhoto(null);
    setTitle('');
    setTagline('');
    setTag('招牌');
    setPrice('');
    setBeautify(false);
    setExposure(50);
    setContrast(50);
    setSaturation(50);
    setColorId('brand');
    setVersion('bottom-card');
    setRatio('1:1');
  }

  function handleAiGenerate() {
    if (!photo) { setToast("请先上传照片"); return; }
    setGenerating(true);
    const params: any = {
      preset: "dish",
      variant: VERSIONS.find(v => v.id === version)?.name || "经典居中",
      platform: ratio === "1:1" ? "dianping" : ratio === "4:5" ? "xiaohongshu" : "douyin",
      text: [tagline, tag, price ? ("" + price) : ""].filter(Boolean).join(" | "),
      count: 2,
      imageDataUrl: photo,
      dishDescription: analysisResult?.detailed_description || title,
      anchorDetails: analysisResult?.anchor_details?.join("; ") || "",
      dishName: title,
    };
    if (onGenerate) onGenerate(params);
    setGenerating(false);
  }

  const filterStyle = beautify
    ? {
        filter: `brightness(${0.8 + (exposure / 100) * 0.4}) contrast(${0.85 + (contrast / 100) * 0.35}) saturate(${0.7 + (saturation / 100) * 0.7})`,
      }
    : {};

  /* ---- 版式叠加渲染 ---- */
  function renderOverlay() {
    if (!photo) return null;
    const t = title || '菜名待填写';

    switch (version) {
      case 'white-frame':
        return (
          <div className="absolute inset-3 border-8 pointer-events-none" style={{ borderColor: '#F2EDE4' }}>
            <div className="absolute left-2 bottom-2 px-2 py-0.5 text-xs font-semibold"
                 style={{ background: '#F2EDE4', color: T.workBg, fontFamily: SANS }}>{t}</div>
          </div>
        );
      case 'round-border':
        return (
          <div className="absolute inset-3 rounded-2xl pointer-events-none" style={{ boxShadow: `inset 0 0 0 6px ${accent}` }}>
            <div className="absolute left-4 top-4 px-2.5 py-1 rounded-full text-xs font-semibold"
                 style={{ background: accent, color: accentText, fontFamily: SANS }}>{t}</div>
          </div>
        );
      case 'centered':
        return (
          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
            <div className="px-4 pt-10 pb-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
              <div className="text-center text-lg font-bold" style={{ color: '#fff', fontFamily: SANS }}>{t}</div>
            </div>
          </div>
        );
      case 'top-bar':
        return (
          <div className="absolute inset-x-0 top-0 px-3 py-2 pointer-events-none flex items-center justify-between"
               style={{ background: accent }}>
            <span className="text-xs font-bold" style={{ color: accentText, fontFamily: SANS }}>
              {tagline || '限时活动文案'}
            </span>
            {price && (
              <span className="text-xs font-bold" style={{ color: accentText, fontFamily: MONO }}>¥{price}</span>
            )}
          </div>
        );
      case 'corner-tag':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow"
                 style={{ background: accent, color: accentText, fontFamily: SANS }}>{tag}</div>
            <div className="absolute left-3 bottom-3 px-2 py-0.5 rounded text-xs font-medium"
                 style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: SANS }}>{t}</div>
          </div>
        );
      case 'bottom-card':
        return (
          <div className="absolute inset-x-3 bottom-3 rounded-lg px-3 py-2.5 pointer-events-none flex items-center justify-between"
               style={{ background: '#F2EDE4' }}>
            <div>
              <div className="text-sm font-bold" style={{ color: T.workBg, fontFamily: SANS }}>{t}</div>
              {tagline && <div className="text-xs mt-0.5" style={{ color: '#7A6F5F', fontFamily: SANS }}>{tagline}</div>}
            </div>
            {price && (
              <div className="text-base font-bold shrink-0 ml-3" style={{ color: accent, fontFamily: MONO }}>¥{price}</div>
            )}
          </div>
        );
      case 'quote-card':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
               style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="text-center text-xl font-bold leading-snug" style={{ color: '#fff', fontFamily: SANS }}>
              {tagline || '你的金句写在这里'}
            </div>
          </div>
        );
      case 'color-block':
        return (
          <div className="absolute right-0 top-0 bottom-0 w-2/5 flex flex-col justify-center gap-2 px-3 pointer-events-none"
               style={{ background: accent }}>
            <div className="text-xs font-semibold" style={{ color: accentText, fontFamily: SANS }}>{tag}</div>
            <div className="text-sm font-bold leading-snug" style={{ color: accentText, fontFamily: SANS }}>{tagline || t}</div>
            {price && <div className="text-sm font-bold" style={{ color: accentText, fontFamily: MONO }}>¥{price}</div>}
          </div>
        );
      case 'magazine':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: accent }} />
            <div className="absolute left-4 top-4 text-xs font-semibold tracking-widest uppercase"
                 style={{ color: '#fff', fontFamily: MONO }}>{tag}</div>
            <div className="absolute left-4 bottom-4 right-4">
              <div className="text-lg font-bold" style={{ color: '#fff', fontFamily: SANS }}>{t}</div>
              <div className="w-8 border-t my-1.5" style={{ borderColor: accent }} />
              <div className="text-xs" style={{ color: '#E4DDCF', fontFamily: SANS }}>{tagline}</div>
            </div>
          </div>
        );
      case 'polaroid':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2" style={{ border: '10px solid #F5F1E8', borderBottomWidth: 44 }} />
            <div className="absolute left-6 bottom-3 text-base" style={{ color: '#3A342C', fontFamily: HAND }}>{t}</div>
          </div>
        );
      case 'diagonal':
        return (
          <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none flex items-end px-4 pb-4"
               style={{ background: accent, clipPath: 'polygon(0 35%, 100% 0, 100% 100%, 0 100%)' }}>
            <div className="text-sm font-bold" style={{ color: accentText, fontFamily: SANS }}>{tagline || t}</div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ background: T.workBg, fontFamily: SANS }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; }
        }
        input[type="range"] { accent-color: ${accent}; }
      `}</style>

      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
        <div>
          <div className="text-base font-bold tracking-wide" style={{ color: T.textPrimary }}>菜品出图</div>
          <div className="text-xs mt-0.5" style={{ color: T.textFaint }}>上传照片 → 选版式 → 加文字 → 直接发布</div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus-visible:ring-2"
          style={{ borderColor: T.border, color: T.textSecondary }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> 清空重来
        </button>
      </div>

      {/* 素材提醒横幅 */}
      {bannerOpen && assetCount < 3 && (
        <div className="mx-5 mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-xs"
             style={{ background: T.card, color: T.textSecondary, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" style={{ color: T.accentDefault }} />
            <span>今天没拍照？公休、优惠、节庆活动公告，不用照片也能做图 —— 到「文案创作」做文字卡</span>
          </div>
          <button onClick={() => setBannerOpen(false)} className="shrink-0 focus:outline-none">
            <X className="w-3.5 h-3.5" style={{ color: T.textFaint }} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 p-5">
        {/* 左：画布 */}
        <div className="lg:flex-1 flex flex-col items-center">
          <div
            className="relative w-full max-w-md rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: T.stage, aspectRatio: RATIOS.find((r) => r.id === ratio).ratio, border: `1px solid ${T.border}` }}
          >
            {photo ? (
              <>
                <img src={photo} alt="菜品照片预览" className="absolute inset-0 w-full h-full object-cover" style={filterStyle} />
                {renderOverlay()}
                {recognizing && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(19,18,17,0.55)' }}>
                    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                         style={{ background: T.card, color: T.textPrimary }}>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: accent }} />
                      AI 识别中…
                    </div>
                  </div>
                )}
                {!recognizing && title && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                       style={{ background: 'rgba(19,18,17,0.6)', color: T.textPrimary }}>
                    <Sparkles className="w-3 h-3" style={{ color: accent }} /> AI 已识别，可编辑
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-center px-8 py-10 rounded-lg border-2 border-dashed transition-colors focus:outline-none focus-visible:ring-2"
                style={{ borderColor: T.border, color: T.textFaint }}
              >
                <ImagePlus className="w-8 h-8" style={{ color: T.textFaint }} />
                <span className="text-sm font-medium" style={{ color: T.textSecondary }}>点击上传菜品照</span>
                <span className="text-xs">支持 JPG / PNG，仅使用你上传的真实照片</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {photo && (
            <div className="w-full max-w-md mt-3 space-y-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs underline underline-offset-2 focus:outline-none"
                style={{ color: T.accentDefault }}
              >
                换一张照片
              </button>
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5" style={{ color: T.textFaint }} />
                <span className="text-xs w-8" style={{ color: T.textFaint }}>放大</span>
                <input type="range" min="0" max="100" value={zoom} onChange={(e) => setZoom(+e.target.value)} className="flex-1" />
                <span className="text-xs w-8 text-right" style={{ fontFamily: MONO, color: T.textFaint }}>{(zoom / 50).toFixed(1)}x</span>
              </div>
              <div className="text-xs flex items-start gap-1.5" style={{ color: T.textFaint }}>
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                放大时可拖曳照片调整取景位置，避免食物不被文字遮住
              </div>
            </div>
          )}
        </div>

        {/* 右：工单式控制面板 */}
        <div className="w-full shrink-0 rounded-xl overflow-hidden" style={{ background: T.panelBg, border: `1px solid ${T.border}`, maxWidth: '420px' }}>
          <TornEdge color={T.workBg} />
          <div className="p-5">

            {/* 01 尺寸 */}
            <SectionHeader n="01" title="尺寸" />
            <div className="grid grid-cols-3 gap-2 mb-6">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  title={r.hint}
                  className="py-2 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2"
                  style={{
                    background: ratio === r.id ? T.accentDefault : T.card,
                    color: ratio === r.id ? contrastText(T.accentDefault) : T.textSecondary,
                    border: `1px solid ${ratio === r.id ? T.accentDefault : T.border}`,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* 02 版型 */}
            <SectionHeader n="02" title="版型" />
            <div className="grid grid-cols-3 gap-2 mb-2">
              {VERSIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVersion(v.id)}
                  title={v.desc}
                  className="py-2 px-1 rounded-lg text-xs font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2"
                  style={{
                    background: version === v.id ? 'rgba(232,163,61,0.15)' : T.card,
                    color: version === v.id ? T.accentDefault : T.textSecondary,
                    border: `1px solid ${version === v.id ? T.accentDefault : T.border}`,
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <div className="text-xs mb-6" style={{ color: T.textFaint }}>
              {VERSIONS.find((v) => v.id === version)?.group} · {VERSIONS.find((v) => v.id === version)?.desc}
            </div>

            {/* 03 配色 */}
            <SectionHeader n="03" title="配色" />
            <div className="flex flex-wrap gap-2.5 mb-6">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  title={c.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform focus:outline-none focus-visible:ring-2"
                  style={{
                    background: c.hex,
                    boxShadow: colorId === c.id ? `0 0 0 2px ${T.panelBg}, 0 0 0 3.5px ${c.hex}` : `0 0 0 1px ${T.border}`,
                    transform: colorId === c.id ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {colorId === c.id && <Check className="w-3.5 h-3.5" style={{ color: contrastText(c.hex) }} />}
                  {c.isBrand && <span className="sr-only">品牌色</span>}
                </button>
              ))}
            </div>

            {/* 04 文字 */}
            <SectionHeader n="04" title="文字" />
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs mb-1 block" style={{ color: T.textFaint }}>标题（大字）</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：招牌小炒"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: T.card, color: T.textPrimary, border: `1px solid ${T.border}` }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs" style={{ color: T.textFaint }}>标语（小字，选填）</label>
                  <span className="text-xs flex items-center gap-1" style={{ color: T.accentDefault }}>
                    <Sparkles className="w-3 h-3" /> AI 推荐
                  </span>
                </div>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="例：现炒现出锅"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none mb-1.5"
                  style={{ background: T.card, color: T.textPrimary, border: `1px solid ${T.border}` }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {TAGLINE_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTagline(s)}
                      className="text-xs px-2 py-1 rounded-full transition-colors focus:outline-none"
                      style={{ background: T.card, color: T.textSecondary, border: `1px solid ${T.border}` }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: T.textFaint }}>标签（选填）</label>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map((tg) => (
                    <button
                      key={tg}
                      onClick={() => setTag(tag === tg ? '' : tg)}
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors focus:outline-none"
                      style={{
                        background: tag === tg ? T.accentDefault : T.card,
                        color: tag === tg ? contrastText(T.accentDefault) : T.textSecondary,
                        border: `1px solid ${tag === tg ? T.accentDefault : T.border}`,
                      }}
                    >
                      {tg}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: T.textFaint }}>价格（选填）</label>
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                  <span className="text-sm" style={{ color: T.textFaint, fontFamily: MONO }}>¥</span>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="例 28"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    style={{ color: T.textPrimary, fontFamily: MONO }}
                  />
                </div>
              </div>
            </div>

            {/* 05 美化 */}
            <SectionHeader n="05" title="美化" />
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input type="checkbox" checked={beautify} onChange={(e) => setBeautify(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm" style={{ color: T.textPrimary }}>自动美化（曝光 / 对比度 / 饱和度）</span>
            </label>
            <div className="space-y-2.5 mb-2" style={{ opacity: beautify ? 1 : 0.35 }}>
              {[
                { label: '曝光', v: exposure, set: setExposure },
                { label: '对比度', v: contrast, set: setContrast },
                { label: '饱和度', v: saturation, set: setSaturation },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xs w-12" style={{ color: T.textFaint }}>{s.label}</span>
                  <input
                    type="range" min="0" max="100" value={s.v} disabled={!beautify}
                    onChange={(e) => s.set(+e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <div className="text-xs flex items-start gap-1.5 mb-6" style={{ color: T.textFaint }}>
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              仅做曝光 / 对比度 / 饱和度增强，不会改变食物本身构成，也不会生成不存在的菜
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => setToast('已存入素材库')}
                disabled={!photo}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
                style={{ background: T.accentDefault, color: contrastText(T.accentDefault) }}
              >
                <Sparkles className="w-4 h-4" /> {generating ? "AI 生成中..." : "AI 生成"}
              </button>
              <button
                onClick={() => setToast('已生成 PNG，正在下载')}
                disabled={!photo}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
                style={{ background: T.card, color: T.textPrimary, border: `1px solid ${T.border}` }}
              >
                镖点图：{anchorImages.length} 张
              </button>
            </div>
            <div className="text-xs mt-3 leading-relaxed" style={{ color: T.textFaint }}>
              输出为{RATIOS.find((r) => r.id === ratio).label}，只美化你上传的真实照片，不会生成不存在的菜。
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
             style={{ background: T.card, color: T.textPrimary, border: `1px solid ${T.border}` }}>
          <Check className="w-4 h-4" style={{ color: T.success }} />
          {toast}
        </div>
      )}
    </div>
  );
}
