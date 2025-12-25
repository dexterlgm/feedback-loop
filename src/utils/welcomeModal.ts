export const checkWelcomeModal = () => {
	const WELCOME_LAST_SHOWN_KEY = "welcome_modal_last_shown_at";
	const ONE_DAY_MS = 24 * 60 * 60 * 1000;

	const raw = localStorage.getItem(WELCOME_LAST_SHOWN_KEY);
	const lastShown = raw ? Number(raw) : 0;
	const lastShownOk = lastShown > 0;
	const isWithinCooldown = lastShownOk && Date.now() - lastShown < ONE_DAY_MS;

	return !isWithinCooldown;
};

export const setWelcomeModalShown = () => {
	const WELCOME_LAST_SHOWN_KEY = "welcome_modal_last_shown_at";
	localStorage.setItem(WELCOME_LAST_SHOWN_KEY, String(Date.now()));
};
