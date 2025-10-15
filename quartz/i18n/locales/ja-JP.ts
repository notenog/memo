import { Translation } from "./definition"

export default {
  propertyDefaults: {
    title: "無題",
    description: "説明なし",
  },
  components: {
    callout: {
      note: "Note",
      abstract: "Abstract",
      info: "Info",
      todo: "Todo",
      tip: "Tip",
      success: "Success",
      question: "Question",
      warning: "Warning",
      failure: "Failure",
      danger: "Danger",
      bug: "Bug",
      example: "例",
      quote: "引用",
    },
    backlinks: {
      title: "バックリンク",
      noBacklinksFound: "バックリンクはありません",
    },
    themeToggle: {
      lightMode: "ライトモード",
      darkMode: "ダークモード",
    },
    readerMode: {
      title: "リーダーモード",
    },
    explorer: {
      title: "📂 一覧",
    },
    footer: {
      createdWith: "Created with",
    },
    graph: {
      title: "グラフビュー",
    },
    recentNotes: {
      title: "最近の記事",
      seeRemainingMore: ({ remaining }) => `さらに${remaining}件 →`,
    },
    transcludes: {
      transcludeOf: ({ targetSlug }) => `${targetSlug}のまとめ`,
      linkToOriginal: "元記事へのリンク",
    },
    search: {
      title: "Search",
      searchBarPlaceholder: "検索ワードを入力",
    },
    tableOfContents: {
      title: "📄 Contents",
    },
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min read`,
    },
  },
  pages: {
    rss: {
      recentNotes: "最近の記事",
      lastFewNotes: ({ count }) => `最新の${count}件`,
    },
    error: {
      title: "Not Found",
      notFound: "ページが存在しないか、非公開設定になっています。",
      home: "Back",
    },
    folderContent: {
      folder: "フォルダ",
      itemsUnderFolder: ({ count }) => `${count}件のページ`,
    },
    tagContent: {
      tag: "タグ",
      tagIndex: "タグ一覧",
      itemsUnderTag: ({ count }) => `${count}件のページ`,
      showingFirst: ({ count }) => `のうち最初の${count}件を表示しています`,
      totalTags: ({ count }) => `全${count}個のタグを表示中`,
    },
  },
} as const satisfies Translation
