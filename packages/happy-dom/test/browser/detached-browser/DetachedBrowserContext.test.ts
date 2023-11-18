import DetachedBrowser from '../../../src/browser/detached-browser/DetachedBrowser';
import DetachedBrowserPage from '../../../src/browser/detached-browser/DetachedBrowserPage';
import Window from '../../../src/window/Window';
import { describe, it, expect, afterEach, vi } from 'vitest';

describe('DetachedBrowserContext', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('get pages()', () => {
		it('Returns the pages.', () => {
			const window = new Window();
			const browser = new DetachedBrowser(Window, window);
			expect(browser.defaultContext.pages.length).toBe(1);
			expect(browser.defaultContext.pages[0].mainFrame.window).toBe(window);
			const page = browser.defaultContext.newPage();
			expect(browser.defaultContext.pages.length).toBe(2);
			expect(browser.defaultContext.pages[0].mainFrame.window).toBe(window);
			expect(browser.defaultContext.pages[1]).toBe(page);
		});
	});

	describe('get browser()', () => {
		it('Returns the browser.', () => {
			const browser = new DetachedBrowser(Window, new Window());
			expect(browser.defaultContext.browser).toBe(browser);
		});
	});

	describe('close()', () => {
		it('Closes the context.', () => {
			const browser = new DetachedBrowser(Window, new Window());
			const context = browser.defaultContext;
			const page1 = context.newPage();
			const page2 = context.newPage();
			const originalClose1 = page1.close;
			const originalClose2 = page2.close;
			let pagesClosed = 0;
			vi.spyOn(page1, 'close').mockImplementation(() => {
				pagesClosed++;
				originalClose1.call(page1);
			});
			vi.spyOn(page2, 'close').mockImplementation(() => {
				pagesClosed++;
				originalClose2.call(page2);
			});
			expect(browser.contexts.length).toBe(1);
			context.close();
			expect(browser.contexts.length).toBe(0);
			expect(pagesClosed).toBe(2);
		});
	});

	describe('whenComplete()', () => {
		it('Waits for all pages to complete.', async () => {
			const browser = new DetachedBrowser(Window, new Window());
			const page1 = browser.newPage();
			const page2 = browser.newPage();
			page1.evaluate('setTimeout(() => { globalThis.test = 1; }, 10);');
			page2.evaluate('setTimeout(() => { globalThis.test = 2; }, 10);');
			await browser.defaultContext.whenComplete();
			expect(page1.mainFrame.window['test']).toBe(1);
			expect(page2.mainFrame.window['test']).toBe(2);
		});
	});

	describe('abort()', () => {
		it('Aborts all ongoing operations.', async () => {
			const browser = new DetachedBrowser(Window, new Window());
			const page1 = browser.newPage();
			const page2 = browser.newPage();
			page1.evaluate('setTimeout(() => { globalThis.test = 1; }, 10);');
			page2.evaluate('setTimeout(() => { globalThis.test = 2; }, 10);');
			browser.defaultContext.abort();
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(page1.mainFrame.window['test']).toBeUndefined();
			expect(page2.mainFrame.window['test']).toBeUndefined();
		});
	});

	describe('newPage()', () => {
		it('Creates a new page.', () => {
			const window = new Window();
			const browser = new DetachedBrowser(Window, window);
			const page = browser.defaultContext.newPage();
			expect(page instanceof DetachedBrowserPage).toBe(true);
			expect(browser.defaultContext.pages.length).toBe(2);
			expect(browser.defaultContext.pages[0].mainFrame.window).toBe(window);
			expect(browser.defaultContext.pages[1]).toBe(page);
		});

		it('Supports opener as parameter.', () => {
			const window = new Window();
			const browser = new DetachedBrowser(Window, window);
			const page1 = browser.defaultContext.newPage();
			const page2 = browser.defaultContext.newPage(page1.mainFrame);
			expect(page2.mainFrame.opener).toBe(page1.mainFrame);
		});
	});
});
