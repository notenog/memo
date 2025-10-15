import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"



// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
 

    Component.Explorer({
      title: "Explorer",
      sortFn: (a, b) => {
        const orderA = a.frontmatter?.order ?? 999
        const orderB = b.frontmatter?.order ?? 999
        
        if (orderA !== orderB) {
          return orderA - orderB
        }
        
        return a.name.localeCompare(b.name, "ja")
      },
    }),
  ],
  right: [
    //Component.Graph(),
   Component.Search(),

    Component.DesktopOnly(Component.TableOfContents()),
    //Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Darkmode() },
      ],
    }),


    Component.Explorer({
  title: "Explorer",
  sortFn: (a, b) => {
    // orderフィールドを取得（なければ999を設定）
    const orderA = a.frontmatter?.order ?? 999
    const orderB = b.frontmatter?.order ?? 999
    
    // order順にソート
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // orderが同じ場合はアルファベット順
    return a.name.localeCompare(b.name, "ja")
  },
}),
  ],
  right: [
  Component.Search(),
  ],
}
