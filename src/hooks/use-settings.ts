'use client';

import { useState, useEffect, useCallback } from 'react';

export type WeekStartDay = 'sunday' | 'monday';
export type DefaultReminder = 'none' | '1_hour_before' | '1_day_before' | '3_days_before';

export interface AppSettings {
  weekStart: WeekStartDay;
  defaultReminder: DefaultReminder;
}

const defaultSettings: AppSettings = {
  weekStart: 'sunday',
  defaultReminder: '1_day_before',
};

const SETTINGS_KEY = 'taskverse-settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      setSettings(defaultSettings);
    }
  }, []);

  const setSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prevSettings => {
      const newSettings = { ...(prevSettings || defaultSettings), [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
      return newSettings;
    });
  }, []);

  return { settings: settings || defaultSettings, setSetting };
}
