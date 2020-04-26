import { Icon, Menu, Popover } from '@blueprintjs/core';
import { PanelPage } from '@/Constants';
import { Bridge } from '@/Bridge';
import React, { FunctionComponent, useState } from 'react';
import { usePanelStore } from '@/Stores/PanelStore';

interface Props {
  log: DDPLog;
}

export const DDPLogMenu: FunctionComponent<Props> = ({ log }) => {
  const store = usePanelStore();

  const [isBookmarked, setBookmarked] = useState(
    store.bookmarkStore.bookmarkIds.includes(log.id),
  );

  const MenuElement = (
    <Menu>
      <Menu.Item
        text='Stacktrace'
        icon='eye-open'
        onClick={() => log.trace && store.setActiveStackTrace(log.trace)}
      />
      <Menu.Item
        text={isBookmarked ? 'Remove' : 'Save'}
        icon={isBookmarked ? 'star' : 'star-empty'}
        onClick={() =>
          store.bookmarkStore.bookmarkIds.includes(log.id)
            ? store.bookmarkStore.remove(log)
            : store.bookmarkStore.add(log)
        }
      />
      {log.parsedContent?.msg === 'method' && (
        <Menu.Item
          text='Replay'
          icon='play'
          onClick={() => {
            store.setSelectedTabId(PanelPage.DDP);

            Bridge.sendContentMessage({
              eventType: 'ddp-run-method',
              data: log.parsedContent,
            });
          }}
        />
      )}
    </Menu>
  );

  return (
    <div className='menu'>
      <Popover content={MenuElement}>
        <Icon
          icon='more'
          onClick={() => {
            setBookmarked(store.bookmarkStore.bookmarkIds.includes(log.id));
          }}
          style={{ cursor: 'pointer' }}
        />
      </Popover>
    </div>
  );
};