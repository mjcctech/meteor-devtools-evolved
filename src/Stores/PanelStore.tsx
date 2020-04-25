import { action, computed, observable, toJS } from 'mobx';
import React, { createContext, FunctionComponent } from 'react';
import { BookmarkStore } from './Panel/BookmarkStore';
import { DDPStore } from './Panel/DDPStore';
import { MinimongoStore } from './Panel/MinimongoStore';
import { PanelPage } from '@/Constants';
import { SettingStore } from '@/Stores/Panel/SettingStore';
import { inDevelopmentOnly } from '@/Utils';

export class PanelStoreConstructor {
  @observable selectedTabId: string = PanelPage.DDP;
  @observable activeObject: ViewableObject = null;
  @observable.shallow activeStackTrace: StackTrace[] | null = null;

  @observable isAboutVisible = false;
  @observable subscriptions: Record<string, MeteorSubscription> = {};

  ddpStore = new DDPStore();
  bookmarkStore = new BookmarkStore();
  minimongoStore = new MinimongoStore();
  settingStore = new SettingStore();

  constructor() {
    this.bookmarkStore.sync().catch(console.error);
  }

  @action
  syncSubscriptions(subscriptions: Record<string, MeteorSubscription>) {
    this.subscriptions = subscriptions;

    console.log(this.subscriptions);

    inDevelopmentOnly(() => {
      console.table(toJS(this.subscriptions));
    });
  }

  @action
  setActiveObject(viewableObject: ViewableObject) {
    this.activeObject = viewableObject;
  }

  @action
  setActiveStackTrace(trace: StackTrace[] | null) {
    this.activeStackTrace = trace;
  }

  @action
  setSelectedTabId(selectedTabId: string) {
    this.selectedTabId = selectedTabId;
  }

  @action
  setAboutVisible(isAboutVisible: boolean) {
    this.isAboutVisible = isAboutVisible;
  }

  @action
  getSubscriptionById(id: string) {
    const subs = toJS(this.subscriptions);

    return id in subs ? subs[id] : null;
  }
}

export const PanelStore = new PanelStoreConstructor();

const PanelStoreContext = createContext<PanelStoreConstructor | null>(null);

export const PanelStoreProvider: FunctionComponent = ({ children }) => (
  <PanelStoreContext.Provider value={PanelStore}>
    {children}
  </PanelStoreContext.Provider>
);

export const usePanelStore = () => {
  const store = React.useContext(PanelStoreContext);

  if (!store) {
    throw new Error('Must be used within a provider.');
  }

  return store;
};
