import BottomNav from './BottomNav'
import styles from './Layout.module.css'

export default function Layout({ children, title, rightAction, dark = false }) {
  return (
    <div className={`${styles.wrap} ${dark ? styles.wrapDark : ''}`}>
      <header className={`${styles.header} ${dark ? styles.headerDark : ''}`}>
        <h1 className={`${styles.title} ${dark ? styles.titleDark : ''}`}>{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </header>
      <main className={`${styles.main} ${dark ? styles.mainDark : ''}`}>
        {children}
      </main>
      <BottomNav dark={dark} />
    </div>
  )
}
