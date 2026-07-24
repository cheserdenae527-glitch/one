
// ═══════════════════════════════════════════
// 抖音子类型 Schema
// ═══════════════════════════════════════════

const dyNicknameSchema: SubTypeFormSchema = {
  subTypeId: "douyin_nickname",
  sections: [{ title: "\u6635\u79f0\u8bbe\u7f6e", fields: [
    { key: "brandName", type: "text", label: "\u54c1\u724c\u540d\u79f0", placeholder: "\u5982\uff1a\u6e1d\u5473\u8001\u8857\u706b\u9505", required: true },
    { key: "city", type: "text", label: "\u57ce\u5e02", placeholder: "\u5982\uff1a\u6210\u90fd", required: true },
    { key: "category", type: "text", label: "\u54c1\u7c7b\u5173\u952e\u8bcd", placeholder: "\u5982\uff1a\u706b\u9505/\u5ddd\u83dc/\u5976\u8336", required: true },
    { key: "tagline", type: "segmented", label: "\u540e\u7f00\u5f15\u6d41\u8bcd", options: ["\u672c\u5730\u5fc5\u6253\u5361", "\u4eba\u5747XX", "\u8001\u5b57\u53f7", "\u6392\u961f\u738b", "\u672c\u5730\u4eba\u63a8\u8350"], defaultValue: "\u672c\u5730\u5fc5\u6253\u5361" },
    { key: "includeEmoji", type: "toggle", label: "\u5305\u542b Emoji \u5206\u9694\u7b26", defaultValue: true },
  ]}],
};
const dyBioSchema: SubTypeFormSchema = {
  subTypeId: "douyin_bio",
  sections: [{ title: "\u7b80\u4ecb\u8bbe\u7f6e", fields: [
    { key: "coreSelling", type: "text", label: "\u6838\u5fc3\u5356\u70b9\u4e00\u53e5\u8bdd", placeholder: "\u5982\uff1a\u6210\u90fd\u6700\u9999\u7684\u9ebb\u8fa3\u8001\u706b\u9505", required: true },
    { key: "features", type: "multiselect", label: "\u7279\u8272\u6807\u7b7e\uff08\u90092-3\u4e2a\uff09", options: ["\u6bcf\u65e5\u7a7a\u8fd0\u6bdb\u809a", "20\u5e74\u8001\u5e97", "\u73b0\u7092\u5e95\u6599", "\u751c\u54c1\u514d\u8d39\u5403", "\u8425\u4e1a\u5230\u51cc\u66682\u70b9", "\u5305\u53a2\u53ef\u8ba2", "\u6392\u961f\u738b", "\u672c\u5730\u4eba\u8ba4\u8bc1"] },
    { key: "address", type: "text", label: "\u95e8\u5e97\u5730\u5740", placeholder: "\u5982\uff1a\u6625\u7199\u8defXX\u53f7", required: true },
    { key: "highlight", type: "text", label: "\u60f3\u5f3a\u8c03\u7684\u9644\u52a0\u4fe1\u606f\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u6bcf\u5468\u4e94\u4f1a\u5458\u65e58\u6298" },
  ]}],
};
const dyTitleSchema: SubTypeFormSchema = {
  subTypeId: "douyin_title",
  sections: [{ title: "\u6807\u9898\u8bbe\u7f6e", fields: [
    { key: "hookType", type: "segmented", label: "\u94a9\u5b50\u7c7b\u578b", options: ["\u6570\u5b57\u51b2\u51fb", "\u53cd\u95ee\u597d\u5947", "\u5229\u76ca\u76f4\u7ed9", "\u5730\u57df\u8ba4\u540c", "\u60c5\u611f\u5171\u9e23", "\u70ed\u8bcd\u501f\u52bf"], defaultValue: "\u6570\u5b57\u51b2\u51fb" },
    { key: "keyword", type: "text", label: "\u6838\u5fc3\u5173\u952e\u8bcd", placeholder: "\u5982\uff1a\u706b\u9505/\u5468\u672b/\u6253\u5361" },
    { key: "includeNumber", type: "toggle", label: "\u5305\u542b\u6570\u5b57", defaultValue: true },
    { key: "includeEmoji", type: "toggle", label: "\u5305\u542b Emoji", defaultValue: true },
    { key: "useHotTopics", type: "toggle", label: "\u5173\u8054\u70ed\u70b9\u8bcd\uff08\u9009\u586b\uff09", defaultValue: false, helpText: "Phase 2 \u81ea\u52a8\u5339\u914d\u5f53\u65e5\u672c\u5730\u70ed\u70b9" },
    { key: "batchCount", type: "segmented", label: "\u751f\u6210\u6570\u91cf", options: ["1\u4e2a", "3\u4e2a", "5\u4e2a"], defaultValue: "3\u4e2a" },
  ]}],
};
const dyDescriptionSchema: SubTypeFormSchema = {
  subTypeId: "douyin_description",
  sections: [
    { title: "\u89c6\u9891\u4fe1\u606f", fields: [
      { key: "videoTopic", type: "textarea", label: "\u672c\u89c6\u9891\u4e3b\u9898", placeholder: "\u4e00\u53e5\u8bdd\u63cf\u8ff0\u89c6\u9891\u5185\u5bb9", required: true },
      { key: "dishList", type: "textarea", label: "\u6d89\u53ca\u7684\u83dc\u54c1\uff08\u6bcf\u884c\u4e00\u4e2a\uff09", placeholder: "\u6bdb\u809a\\n\u9e2d\u80a0\\n\u725b\u8089" },
      { key: "videoType", type: "segmented", label: "\u89c6\u9891\u7c7b\u578b", options: ["\u63a2\u5e97\u6253\u5361", "\u83dc\u54c1\u5c55\u793a", "\u5236\u4f5c\u8fc7\u7a0b", "\u4f18\u60e0\u6d3b\u52a8", "\u6545\u4e8b\u5206\u4eab", "\u5bf9\u6bd4\u8bc4\u6d4b"], defaultValue: "\u83dc\u54c1\u5c55\u793a" },
    ]},
    { title: "\u6587\u6848\u7b56\u7565", fields: [
      { key: "hookType", type: "segmented", label: "\u5f00\u5934\u94a9\u5b50\u7c7b\u578b", options: ["\u611f\u5b98\u51b2\u51fb", "\u53cd\u5e38\u8bc6", "\u5229\u76ca\u76f4\u7ed9", "\u60ac\u5ff5\u597d\u5947", "\u8eab\u4efd\u5171\u9e23", "\u60c5\u611f\u89e6\u53d1"], defaultValue: "\u611f\u5b98\u51b2\u51fb" },
      { key: "hasCoupon", type: "toggle", label: "\u6587\u672b\u6302\u8f7d\u56e2\u8d2d\u94fe\u63a5", defaultValue: true },
      { key: "ctaType", type: "segmented", label: "\u4e92\u52a8\u5f15\u5bfc\u65b9\u5f0f", options: ["\u8bc4\u8bba\u533a\u56de\u590d\u5730\u5740", "\u79c1\u4fe1\u9886\u4f18\u60e0", "\u70b9\u51fb\u4e0b\u5355", "\u5e26\u8bdd\u9898\u53d1\u5e03", "\u5173\u6ce8\u9886\u5238"], defaultValue: "\u8bc4\u8bba\u533a\u56de\u590d\u5730\u5740" },
      { key: "bgmStyle", type: "segmented", label: "BGM \u98ce\u683c", options: ["\u5feb\u8282\u594f\u5361\u70b9", "\u6e29\u99a8\u8212\u7f13", "\u70ed\u8840\u6fc0\u6602", "\u641e\u7b11\u9b54\u6027"], defaultValue: "\u5feb\u8282\u594f\u5361\u70b9" },
      { key: "batchCount", type: "segmented", label: "\u751f\u6210\u6570\u91cf", options: ["1\u4e2a", "3\u4e2a", "5\u4e2a"], defaultValue: "1\u4e2a" },
    ]},
  ],
};
const dySubtitleSchema: SubTypeFormSchema = {
  subTypeId: "douyin_subtitle",
  sections: [{ title: "\u5b57\u5e55\u8bbe\u7f6e", fields: [
    { key: "topic", type: "text", label: "\u89c6\u9891\u4e3b\u9898\u6982\u8ff0", placeholder: "\u5982\uff1a\u4e00\u4e2a\u4eba\u54038\u9053\u83dc", required: true },
    { key: "count", type: "segmented", label: "\u751f\u6210\u53e5\u5b50\u6570\u91cf", options: ["3\u53e5", "5\u53e5", "8\u53e5"], defaultValue: "5\u53e5" },
    { key: "bgmStyle", type: "segmented", label: "BGM \u8282\u594f", options: ["\u5feb\u8282\u594f\uff08\u6bcf2\u79d2\u6362\u53e5\uff09", "\u4e2d\u901f\uff08\u6bcf4\u79d2\u6362\u53e5\uff09", "\u8212\u7f13\uff08\u6bcf6\u79d2\u6362\u53e5\uff09"], defaultValue: "\u5feb\u8282\u594f\uff08\u6bcf2\u79d2\u6362\u53e5\uff09" },
    { key: "useEmoji", type: "toggle", label: "\u5305\u542b Emoji", defaultValue: true },
  ]}],
};
const dyLiveOpenerSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_opener",
  sections: [{ title: "\u76f4\u64ad\u573a\u6b21\u4fe1\u606f", fields: [
    { key: "liveTheme", type: "text", label: "\u76f4\u64ad\u4e3b\u9898", placeholder: "\u5982\uff1a\u5468\u672b\u706b\u9505\u798f\u5229\u4e13\u573a", required: true },
    { key: "products", type: "textarea", label: "\u672c\u573a\u4e0a\u67b6\u5546\u54c1\uff08\u6bcf\u884c\u4e00\u4e2a\uff09", placeholder: "\u53cc\u4eba\u706b\u9505\u5957\u9910 \u00a599\\n\u6bdb\u809a\u534a\u4ef7\u5238 \u00a529" },
    { key: "duration", type: "segmented", label: "\u9884\u4f30\u76f4\u64ad\u65f6\u957f", options: ["30\u5206\u949f", "60\u5206\u949f", "90\u5206\u949f", "\u4e0d\u9650"], defaultValue: "60\u5206\u949f" },
    { key: "welfareHighlight", type: "text", label: "\u6838\u5fc3\u798f\u5229\u4e00\u53e5\u8bdd\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u672c\u573a\u6240\u6709\u5957\u99105\u6298" },
    { key: "tone", type: "segmented", label: "\u5f00\u573a\u98ce\u683c", options: ["\u70ed\u60c5\u9971\u6ee1", "\u4eb2\u5207\u81ea\u7136", "\u5e7d\u9ed8\u641e\u602a", "\u4e13\u4e1a\u6b63\u5f0f"], defaultValue: "\u70ed\u60c5\u9971\u6ee1" },
  ]}],
};
const dyLiveProductSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_product",
  sections: [{ title: "\u5546\u54c1\u4fe1\u606f", fields: [
    { key: "products", type: "list", label: "\u8bb2\u89e3\u5546\u54c1\u5217\u8868", maxItems: 10, fields: [
      { key: "name", type: "text", label: "\u5546\u54c1\u540d\u79f0", placeholder: "\u5982\uff1a\u53cc\u4eba\u706b\u9505\u5957\u9910" },
      { key: "price", type: "text", label: "\u4ef7\u683c", placeholder: "\u5982\uff1a99\u5143" },
      { key: "originalPrice", type: "text", label: "\u539f\u4ef7\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a198\u5143" },
      { key: "coreSelling", type: "text", label: "\u6838\u5fc3\u5356\u70b9", placeholder: "\u5982\uff1a5\u9053\u62db\u724c\u83dc+2\u676f\u996e\u54c1" },
      { key: "highlight", type: "text", label: "\u72ec\u5bb6\u8bb0\u5fc6\u70b9\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u6bdb\u809a\u662f\u91cd\u5e86\u7a7a\u8fd0\u7684" },
    ]},
    { key: "speakingSpeed", type: "segmented", label: "\u8bb2\u89e3\u8bed\u901f", options: ["\u5feb\uff08\u6bcf\u5206\u949f240\u5b57\uff09", "\u6b63\u5e38\uff08\u6bcf\u5206\u949f180\u5b57\uff09", "\u6162\uff08\u6bcf\u5206\u949f140\u5b57\uff09"], defaultValue: "\u6b63\u5e38\uff08\u6bcf\u5206\u949f180\u5b57\uff09" },
    { key: "tone", type: "segmented", label: "\u8bb2\u89e3\u98ce\u683c", options: ["\u4e13\u4e1a\u63a8\u8350\u578b", "\u670b\u53cb\u5b89\u5229\u578b", "\u6fc0\u60c5\u53eb\u5356\u578b"], defaultValue: "\u670b\u53cb\u5b89\u5229\u578b" },
  ]}],
};
const dyLiveCtaSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_cta",
  sections: [{ title: "\u50ac\u5355\u8bbe\u7f6e", fields: [
    { key: "ctaType", type: "segmented", label: "\u8bdd\u672f\u7c7b\u578b", options: ["\u9650\u65f6\u5012\u8ba1\u65f6", "\u9650\u91cf\u5269\u4f59", "\u4ece\u4f17\u70ed\u9500", "\u7c89\u4e1d\u798f\u5229", "\u4e92\u52a8\u62bd\u5956"], defaultValue: "\u9650\u65f6\u5012\u8ba1\u65f6" },
    { key: "productName", type: "text", label: "\u9488\u5bf9\u5546\u54c1", placeholder: "\u5982\uff1a\u53cc\u4eba\u706b\u9505\u5957\u9910" },
    { key: "remainingCount", type: "text", label: "\u5269\u4f59\u6570\u91cf\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u6700\u540e10\u4efd" },
    { key: "countdown", type: "text", label: "\u5012\u8ba1\u65f6\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a3\u5206\u949f" },
    { key: "tone", type: "segmented", label: "\u8bdd\u672f\u5f3a\u5ea6", options: ["\u6e29\u548c\u63d0\u9192", "\u4e2d\u7b49\u7d27\u8feb", "\u5f3a\u70c8\u50ac\u4fc3"], defaultValue: "\u4e2d\u7b49\u7d27\u8feb" },
  ]}],
};
const dyLiveCloserSchema: SubTypeFormSchema = {
  subTypeId: "douyin_live_closer",
  sections: [{ title: "\u6536\u5c3e\u8bbe\u7f6e", fields: [
    { key: "summaryPoints", type: "textarea", label: "\u672c\u573a\u56de\u987e\u8981\u70b9", placeholder: "\u5982\uff1a\u53cc\u4eba\u5957\u9910\u53ef\u53e0\u52a0\u4f1a\u5458\u6298\u6263" },
    { key: "nextLive", type: "text", label: "\u4e0b\u6b21\u76f4\u64ad\u9884\u544a\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u672c\u5468\u4e94\u66528\u70b9\uff0c\u65b0\u83dc\u54c1\u9996\u53d1" },
    { key: "tone", type: "segmented", label: "\u6536\u5c3e\u98ce\u683c", options: ["\u6e29\u6696\u611f\u8c22", "\u6fc0\u60c5\u6536\u5c3e", "\u671f\u5f85\u518d\u89c1"], defaultValue: "\u6e29\u6696\u611f\u8c22" },
  ]}],
};
const dyPromotionSchema: SubTypeFormSchema = {
  subTypeId: "douyin_promotion",
  sections: [{ title: "\u5546\u54c1\u4fe1\u606f", fields: [
    { key: "productName", type: "text", label: "\u5546\u54c1\u540d\u79f0", placeholder: "\u5982\uff1a\u53cc\u4eba\u706b\u9505\u5957\u9910", required: true },
    { key: "price", type: "text", label: "\u4ef7\u683c", placeholder: "\u5982\uff1a99\u5143", required: true },
    { key: "originalPrice", type: "text", label: "\u539f\u4ef7\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a198\u5143" },
    { key: "content", type: "textarea", label: "\u5957\u9910\u5185\u5bb9", placeholder: "\u6bcf\u884c\u4e00\u9879\uff0c\u5982\uff1a\u9505\u5e951\u4efd\uff08\u4efb\u9009\uff09\\n\u6bdb\u809a1\u4efd\\n\u9e2d\u88401\u4efd", required: true },
    { key: "suitableFor", type: "text", label: "\u9002\u5408\u4eba\u7fa4\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a2\u4eba\u7528\u9910/\u60c5\u4fa3\u7ea6\u4f1a" },
    { key: "validPeriod", type: "text", label: "\u6709\u6548\u671f\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u8d2d\u4e70\u540e30\u5929\u5185\u6709\u6548" },
    { key: "restrictions", type: "textarea", label: "\u4f7f\u7528\u9650\u5236\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u4ec5\u9650\u5de5\u4f5c\u65e5\u4f7f\u7528\\n\u9700\u63d0\u524d1\u5929\u9884\u7ea6" },
  ]}],
};
const dyPoiSchema: SubTypeFormSchema = {
  subTypeId: "douyin_poi",
  sections: [{ title: "\u4f4d\u7f6e\u4fe1\u606f", fields: [
    { key: "address", type: "text", label: "\u95e8\u5e97\u5730\u5740", placeholder: "\u5982\uff1a\u6210\u90fd\u5e02\u9526\u6c5f\u533aXX\u8defXX\u53f7", required: true },
    { key: "landmark", type: "text", label: "\u9644\u8fd1\u5730\u6807\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u592a\u53e4\u91cc\u5bf9\u9762/\u5730\u94c12\u53f7\u7ebfA\u53e3" },
    { key: "trafficInfo", type: "text", label: "\u4ea4\u901a\u6307\u5f15\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u5730\u94c13\u53f7\u7ebfA\u53e3\u51fa\u6b65\u884c200\u7c73" },
    { key: "storeHighlights", type: "multiselect", label: "\u95e8\u5e97\u4eae\u70b9", options: ["\u4e34\u8857\u95e8\u9762\u597d\u627e", "\u6709\u514d\u8d39\u505c\u8f66\u573a", "\u8425\u4e1a\u5230\u51cc\u6668", "\u53ef\u8ba2\u5305\u53a2", "\u6709\u5916\u6446\u533a", "\u5ba0\u7269\u53cb\u597d", "\u9002\u5408\u62cd\u7167"] },
    { key: "ownWords", type: "textarea", label: "\u60f3\u8865\u5145\u7684\u8bdd\uff08\u9009\u586b\uff09", placeholder: "\u5982\uff1a\u95e8\u53e3\u6709\u53ea\u62db\u8d22\u732b\uff0c\u5f88\u663e\u773c" },
  ]}],
};
const dyAdSchema: SubTypeFormSchema = {
  subTypeId: "douyin_ad",
  sections: [{ title: "\u6295\u653e\u4fe1\u606f", fields: [
    { key: "adGoal", type: "segmented", label: "\u6295\u653e\u76ee\u6807", options: ["\u95e8\u5e97\u5f15\u6d41", "\u56e2\u8d2d\u4e0b\u5355", "\u7c89\u4e1d\u589e\u957f", "\u54c1\u724c\u66dd\u5149"], defaultValue: "\u95e8\u5e97\u5f15\u6d41" },
    { key: "productName", type: "text", label: "\u63a8\u5e7f\u5185\u5bb9", placeholder: "\u5982\uff1a\u53cc\u4eba\u706b\u9505\u5957\u9910/\u62db\u724c\u6bdb\u809a" },
    { key: "price", type: "text", label: "\u4ef7\u683c/\u5229\u76ca\u70b9", placeholder: "\u5982\uff1a99\u5143/\u514d\u8d39\u9886\u5238" },
    { key: "targetAudience", type: "multiselect", label: "\u5b9a\u5411\u4eba\u7fa4\uff08\u9009\u586b\uff09", options: ["18-25\u5c81", "26-35\u5c81", "36-45\u5c81", "\u672c\u5730\u5c45\u6c11", "\u7f8e\u98df\u7231\u597d\u8005", "\u60c5\u4fa3"] },
    { key: "tone", type: "segmented", label: "\u6587\u6848\u98ce\u683c", options: ["\u5f3a\u94a9\u5b50\u4fc3\u70b9\u51fb", "\u4fe1\u4efb\u611f\u5efa\u7acb", "\u5229\u76ca\u70b9\u9a71\u52a8", "\u60c5\u611f\u5171\u9e23"], defaultValue: "\u5f3a\u94a9\u5b50\u4fc3\u70b9\u51fb" },
  ]}],
};
const dyHashtagSchema: SubTypeFormSchema = {
  subTypeId: "douyin_hashtag",
  sections: [{ title: "\u6807\u7b7e\u8bbe\u7f6e", fields: [
    { key: "cuisine", type: "text", label: "\u54c1\u7c7b", placeholder: "\u5982\uff1a\u706b\u9505/\u5ddd\u83dc/\u5976\u8336", required: true },
    { key: "city", type: "text", label: "\u57ce\u5e02", placeholder: "\u5982\uff1a\u6210\u90fd", required: true },
    { key: "useHotTopics", type: "toggle", label: "\u5173\u8054\u8fd1\u671f\u672c\u5730\u70ed\u70b9", defaultValue: true, helpText: "Phase 2 \u81ea\u52a8\u5339\u914d\u70ed\u95e8\u8bdd\u9898" },
    { key: "customTags", type: "textarea", label: "\u81ea\u5b9a\u4e49\u6807\u7b7e\uff08\u9009\u586b\uff0c\u6bcf\u884c\u4e00\u4e2a\uff09", placeholder: "\u5982\uff1a\u6392\u961f\u738b\u706b\u9505\\n\u8001\u5b57\u53f7\u7f8e\u98df" },
    { key: "tagCount", type: "segmented", label: "\u6807\u7b7e\u6570\u91cf", options: ["3-5\u4e2a", "5-8\u4e2a"], defaultValue: "5-8\u4e2a" },
  ]}],
};
const dyReplySchema: SubTypeFormSchema = {
  subTypeId: "douyin_reply",
  sections: [{ title: "\u8bc4\u8bba\u4fe1\u606f", fields: [
    { key: "replyType", type: "segmented", label: "\u56de\u590d\u7c7b\u578b", options: ["\u611f\u8c22\u597d\u8bc4", "\u7b54\u7591\u89e3\u60d1", "\u5f15\u5bfc\u79c1\u4fe1", "\u5f15\u5bfc\u4e0b\u5355", "\u4e92\u52a8\u56de\u5e94"], defaultValue: "\u611f\u8c22\u597d\u8bc4" },
    { key: "userName", type: "text", label: "\u7528\u6237\u6635\u79f0\uff08\u9009\u586b\uff09", placeholder: "\u5c06\u4f5c\u4e3a\u53d8\u91cf\u63d2\u5165\u56de\u590d" },
    { key: "commentContent", type: "textarea", label: "\u8bc4\u8bba\u5185\u5bb9\uff08\u9009\u586b\uff09", placeholder: "\u7c98\u8d34\u6216\u6982\u62ec\u7528\u6237\u8bf4\u4e86\u4ec0\u4e48" },
    { key: "leadTo", type: "segmented", label: "\u5f15\u5bfc\u65b9\u5411", options: ["\u5f15\u5bfc\u5230\u5e97", "\u5f15\u5bfc\u79c1\u4fe1", "\u5f15\u5bfc\u4e0b\u5355", "\u5f15\u5bfc\u5173\u6ce8", "\u4e0d\u5f15\u5bfc"], defaultValue: "\u5f15\u5bfc\u5230\u5e97" },
    { key: "useEmoji", type: "toggle", label: "\u4f7f\u7528\u8868\u60c5\u7b26\u53f7", defaultValue: true },
    { key: "tone", type: "segmented", label: "\u56de\u590d\u98ce\u683c", options: ["\u70ed\u60c5\u4eb2\u5207", "\u5e7d\u9ed8\u6709\u6897", "\u5b98\u65b9\u793c\u8c8c"], defaultValue: "\u70ed\u60c5\u4eb2\u5207" },
  ]}],
};
