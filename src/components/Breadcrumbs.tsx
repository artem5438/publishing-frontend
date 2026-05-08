import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}
// навигация по сайту
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="mis-breadcrumbs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index}>
            {index > 0 && <span className="sep">/</span>}
            {isLast || !item.path ? (
              <span>{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </span>
        )
      })}
    </div>
  )
}