'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { Card } from '@/components/composites/card';
import { Button } from '@/components/ui/button';

import { PWA_INSTALL_DISMISSED_KEY } from '@/constants/pwa';
import { SITE_CONTENT } from '@/content/site';

/** Chromium only, and not on the standards track. Safari never fires it. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

type Environment = 'blocked' | 'ios' | 'other';

function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari predates display-mode and reports the installed app here.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

function rememberDismissal(): void {
  try {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');
  } catch {
    // A browser that refuses storage still gets a working app.
  }
}

/** The browser never changes its mind mid-session, so there is nothing to watch. */
function subscribeToNothing(): () => void {
  return () => {};
}

function readEnvironment(): Environment {
  if (isInstalled() || wasDismissed()) return 'blocked';
  return isIos() ? 'ios' : 'other';
}

/** The server knows none of this; nothing renders until hydration. */
function readServerEnvironment(): Environment {
  return 'blocked';
}

export function InstallPrompt() {
  const environment = useSyncExternalStore(
    subscribeToNothing,
    readEnvironment,
    readServerEnvironment,
  );
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () =>
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const dismiss = useCallback(() => {
    rememberDismissal();
    setHidden(true);
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    setHidden(true);
  }, [promptEvent]);

  const showsIosHint = environment === 'ios';
  const showsNativeButton = environment === 'other' && promptEvent !== null;

  if (hidden || (!showsIosHint && !showsNativeButton)) return null;

  const { install: content } = SITE_CONTENT;

  return (
    <Card className="border-border mx-4 mb-4 border p-4">
      <p className="text-sm font-medium">{content.title}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        {showsIosHint ? content.iosDescription : content.description}
      </p>
      <div className="mt-3 flex gap-2">
        {showsNativeButton ? (
          <Button type="button" size="sm" onClick={() => void install()}>
            {content.action}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          {content.dismiss}
        </Button>
      </div>
    </Card>
  );
}
