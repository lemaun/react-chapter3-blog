import styles from './header.module.scss'
import Link from 'next/Link'

export default function Header() {


    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Link className={styles.logo} href="/">
                  <a><img src="./Logo.svg" alt="logos" /></a>
                </Link> 
            </div>
        </header>
    )
}
