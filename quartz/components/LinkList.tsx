import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

const LinkList: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  const links = cfg.configuration.theme.footer?.links
  if (!links) {
    return null
  }

  const linkList = Object.entries(links).map(([text, link]) => (
    <li>
      <a href={link} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    </li>
  ))

  return (
    <div class={displayClass}>
      <p>{i18n(cfg.configuration.locale).components.LinkList.text}</p>
      <ul>{linkList}</ul>
    </div>
  )
}

LinkList.css = `
.link-list p {
  margin: 1em 0;
  font-weight: 700;
}
.link-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.link-list li {
  margin: 0.5em 0;
}
`

export default (() => LinkList) satisfies QuartzComponentConstructor