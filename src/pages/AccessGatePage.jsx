import { useState } from 'react'
import { canUnlockAccess } from '../utils/accessGate'
import styles from './AccessGatePage.module.css'

const ACCESS_CODE = import.meta.env.VITE_AUTHORIZED_ACCESS_CODE || ''

export default function AccessGatePage({ onGranted }) {
	const [code, setCode] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = (event) => {
		event.preventDefault()
		if (canUnlockAccess(ACCESS_CODE, code)) {
			onGranted()
			return
		}
		setError(ACCESS_CODE ? 'Code d’accès incorrect' : 'Code d’accès non configuré')
	}

	return (
		<main className={styles.page}>
			<section className={styles.panel}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>▶</span>
					<span className={styles.logoText}>Watchly</span>
				</div>
				<h1 className={styles.title}>Accès privé</h1>
				<p className={styles.description}>
					Planifiez vos films, séries et animes dans un calendrier partagé, pensé pour rester lisible sur
					mobile.
				</p>
				<form className={styles.form} onSubmit={handleSubmit}>
					<label className={styles.label} htmlFor='accessCode'>
						Code d’accès
					</label>
					<input
						id='accessCode'
						value={code}
						onChange={(event) => setCode(event.target.value)}
						className={styles.input}
						type='password'
						autoComplete='one-time-code'
						placeholder='Entrer le code'
					/>
					{error && <div className={styles.error}>{error}</div>}
					<button className={styles.button} type='submit'>
						Entrer
					</button>
				</form>
			</section>
		</main>
	)
}
