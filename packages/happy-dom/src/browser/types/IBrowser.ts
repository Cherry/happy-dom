import IBrowserContext from './IBrowserContext.js';
import IBrowserFrame from './IBrowserFrame.js';
import IBrowserPage from './IBrowserPage.js';
import IBrowserSettings from './IBrowserSettings.js';

/**
 * Browser.
 *
 * Much of the interface for the browser has been taken from Puppeteer and Playwright, so that the API is familiar.
 */
export default interface IBrowser {
	readonly defaultContext: IBrowserContext;
	readonly contexts: IBrowserContext[];
	readonly settings: IBrowserSettings;
	readonly console: Console | null;

	/**
	 * Aborts all ongoing operations and destroys the browser.
	 */
	close(): void;

	/**
	 * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all tasks such as timers are complete.
	 *
	 * @returns Promise.
	 */
	whenComplete(): Promise<void>;

	/**
	 * Aborts all ongoing operations.
	 */
	abort(): void;

	/**
	 * Creates a new incognito context.
	 *
	 * @returns Context.
	 */
	newIncognitoContext(): IBrowserContext;

	/**
	 * Creates a new page.
	 *
	 * @param [opener] Opener.
	 * @returns Page.
	 */
	newPage(opener?: IBrowserFrame): IBrowserPage;
}
