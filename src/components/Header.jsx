import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

export default function Header() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)

	const handleLogout = () => {
		logout()
		navigate('/')
	}

	return (
		<header className={styles.header}>
			<Link to={user ? '/app' : '/'} className={styles.logo}>
				<span className={styles.logoIcon}>▶</span>
				<span className={styles.logoText}>Watchly</span>
			</Link>

			{user ? (
				<nav className={styles.authNav}>
					<NavLink
						to='/app'
						className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
					>
						Calendrier
					</NavLink>
					<NavLink
						to='/profile'
						className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
					>
						Profil
					</NavLink>

					<div className={styles.userMenu}>
						<button
							type='button'
							className={styles.userBtn}
							onClick={() => setMenuOpen(!menuOpen)}
						>
							<div className={styles.avatar}>{user.username?.[0]?.toUpperCase()}</div>
							<span className={styles.username}>{user.username}</span>
							<span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
						</button>

						{menuOpen && (
							<div className={styles.dropdown}>
								<div className={styles.dropEmail}>{user.email}</div>
								<button type='button' className={styles.logoutBtn} onClick={handleLogout}>
									Se déconnecter
								</button>
							</div>
						)}
					</div>
				</nav>
			) : (
				<div className={styles.guestNav}>
					<Link to='/login' className={styles.loginBtn}>
						Connexion
					</Link>
					<Link to='/register' className={styles.registerBtn}>
						S'inscrire
					</Link>
				</div>
			)}
		</header>
	)
}
