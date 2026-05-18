/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

function replaceWOOFiText() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes = [];
  let node = walker.nextNode();
  
  while (node !== null) {
    if (node.textContent && node.textContent.includes('WOOFi Pro')) {
      textNodes.push(node);
    }
    node = walker.nextNode();
  }

  textNodes.forEach(textNode => {
    if (textNode.textContent) {
      textNode.textContent = textNode.textContent.replace(/WOOFi Pro/g, 'Aura');
    }
  });
}

function setupTextReplacement() {
  replaceWOOFiText();

  const observer = new MutationObserver((mutations) => {
    let shouldReplace = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldReplace = true;
      }
    });

    if (shouldReplace) {
      setTimeout(replaceWOOFiText, 0);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
  
  setTimeout(setupTextReplacement, 1000);
});
