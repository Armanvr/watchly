import { useState } from 'react'
import api from '../utils/api'
import Share from '../icons/Share'
import styles from './ShareModal.module.css'

export default function ShareModal({ event, onClose }) {
	const [tab, setTab] = useState('user') // user | link
	const [identifier, setIdentifier] = useState('')
	const [link, setLink] = useState('')
	const [msg, setMsg] = useState('')
	const [loading, setLoading] = useState(false)

	const shareWithUser = async () => {
		setLoading(true)
		setMsg('')
		try {
			const { data } = await api.post(`/events/${event._id}/share`, { identifier })
			setMsg(data.message)
			setIdentifier('')
		} catch (err) {
			setMsg(err.response?.data?.message || 'Erreur')
		} finally {
			setLoading(false)
		}
	}

	const getLink = async () => {
		setLoading(true)
		setMsg('')
		try {
			const { data } = await api.post(`/events/${event._id}/share-link`)
			const url = `${window.location.origin}/share/${data.token}`
			setLink(url)
		} catch (err) {
			setMsg(err.response?.data?.message || 'Erreur')
		} finally {
			setLoading(false)
		}
	}

	const copyLink = () => {
		navigator.clipboard.writeText(link)
		setMsg('Lien copié !')
	}

	return (
		<div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className={`${styles.modal} scale-in`}>
				<div className={styles.header}>
					<h3>Partager « {event.title} »</h3>
					<button className={styles.close} onClick={onClose}>
						✕
					</button>
				</div>

				<div className={styles.tabs}>
					<button className={tab === 'user' ? styles.tabActive : styles.tab} onClick={() => setTab('user')}>
						👤 Par pseudo / email
					</button>
					<button className={tab === 'link' ? styles.tabActive : styles.tab} onClick={() => setTab('link')}>
						<Share /> Lien partageable
					</button>
				</div>

				<div className={styles.body}>
					{tab === 'user' && (
						<div className={styles.userShare}>
							<p className={styles.desc}>
								Entrez le pseudo ou l'email de votre partenaire de visionnage.
							</p>
							<div className={styles.row}>
								<input
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && shareWithUser()}
									placeholder='pseudo ou email...'
									className={styles.input}
								/>
								<button
									className={styles.btn}
									onClick={shareWithUser}
									disabled={loading || !identifier}
								>
									{loading ? '...' : 'Partager'}
								</button>
							</div>
						</div>
					)}

					{tab === 'link' && (
						<div className={styles.linkShare}>
							<p className={styles.desc}>Générez un lien que vous pouvez envoyer à n'importe qui.</p>
							{!link ? (
								<button className={styles.btn} onClick={getLink} disabled={loading}>
									{loading ? 'Génération...' : 'Générer le lien'}
								</button>
							) : (
								<div className={styles.linkBox}>
									<span className={styles.linkText}>{link}</span>
									<button className={styles.copyBtn} onClick={copyLink}>
										Copier
									</button>
								</div>
							)}
						</div>
					)}

					{msg && <div className={styles.msg}>{msg}</div>}
				</div>
			</div>
		</div>
	)
}
