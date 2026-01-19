// Cross-browser compatible JavaScript for the Sprouts Coupon Bot
(() => {
  // Default configuration parameters
  const defaultConfig = {
    baseDelay: 1000, // Base delay in milliseconds for Chrome/Edge
    firefoxDelay: 1500, // Delay for Firefox
    safariDelay: 1500, // Delay for Safari
    maxAttempts: 5, // Default max attempts
    safariMaxAttempts: 6 // Max attempts for Safari
  };

  // Merge user-provided config (if any)
  const config = {
    baseDelay: typeof window.customConfig?.baseDelay === 'number' ? window.customConfig.baseDelay : defaultConfig.baseDelay,
    firefoxDelay: typeof window.customConfig?.firefoxDelay === 'number' ? window.customConfig.firefoxDelay : defaultConfig.firefoxDelay,
    safariDelay: typeof window.customConfig?.safariDelay === 'number' ? window.customConfig.safariDelay : defaultConfig.safariDelay,
    maxAttempts: typeof window.customConfig?.maxAttempts === 'number' ? window.customConfig.maxAttempts : defaultConfig.maxAttempts,
    safariMaxAttempts: typeof window.customConfig?.safariMaxAttempts === 'number' ? window.customConfig.safariMaxAttempts : defaultConfig.safariMaxAttempts
  };

  console.log('Starting Sprouts Coupon Bot with configuration:');
  console.log(JSON.stringify(config, null, 2));

  // Browser detection
  const getBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
    if (ua.includes('edge')) return 'edge';
    return 'chrome';
  };

  const browser = getBrowser();
  console.log(`Detected browser: ${browser}`);

  // Sleep helper
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Cross-browser safe click
  const safeClick = (element) => {
    try {
      element.click();
    } catch (error) {
      try {
        const evt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        element.dispatchEvent(evt);
      } catch (fallbackError) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window);
        element.dispatchEvent(evt);
      }
    }
  };

  // Process a single button
  const processButton = async (button) => {
    try {
      console.log('Clipping Sprouts coupon...');

      safeClick(button);

      // Scroll into view
      try {
        button.scrollIntoView({ behavior: browser === 'safari' ? 'auto' : 'smooth', block: 'center' });
      } catch {
        button.scrollIntoView(true);
      }

      // Browser-specific delay
      let delayTime =
        browser === 'firefox' ? config.firefoxDelay :
        browser === 'safari' ? config.safariDelay :
        config.baseDelay;

      await sleep(delayTime);
      return true;

    } catch (error) {
      console.error('Error processing button:', error);
      return false;
    }
  };

  // Sprouts-specific selector logic
  const findCouponButtons = () => {
    // Sprouts uses literal "Clip" text inside button/div/span
    const elements = [...document.querySelectorAll("button")];

    const clipButtons = elements.filter(el => {
      const text = (el.innerText || "").trim().toLowerCase();
      return text === "clip"; // exact match for Sprouts
    });

    return clipButtons;
  };

  // Process all buttons
  const processAllButtons = async () => {
    const buttons = findCouponButtons();
    console.log(`${buttons.length} Sprouts coupons found.`);

    if (buttons.length === 0) {
      console.log('No coupons to clip. Done!');
      return true;
    }

    for (const button of buttons) {
      await processButton(button);
    }

    // Check if more appeared
    const remaining = findCouponButtons();
    if (remaining.length > 0) {
      console.log(`${remaining.length} coupons still remaining. Running again...`);
      return false;
    }

    console.log('All Sprouts coupons successfully clipped!');
    return true;
  };

  // Main loop
  const run = async () => {
    let complete = false;
    let attempts = 0;
    const maxAttempts = browser === 'safari' ? config.safariMaxAttempts : config.maxAttempts;

    while (!complete && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}...`);
      complete = await processAllButtons();
      await sleep(config.baseDelay);
    }

    console.log('Sprouts Coupon Bot execution completed.');
  };

  run();
})();
