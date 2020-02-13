import React, { FunctionComponent } from 'react';
import { PanelStoreConstructor } from '../../Stores/PanelStore';
import { defer } from 'lodash';
import { flow } from 'lodash/fp';
import { inject, observer } from 'mobx-react';
import { DDPMessage } from './DDP/DDPMessage';

interface Props {
  panelStore?: PanelStoreConstructor;
}

export const DDP: FunctionComponent<Props> = flow(
  observer,
  inject('panelStore'),
)(({ panelStore }) => {
  const logs = panelStore?.ddp.map(message => (
    <DDPMessage message={message} key={message.timestamp} />
  ));

  defer(() => window.scrollTo(0, document.body.scrollHeight));

  return <div className='mde-ddp'>{logs}</div>;
});
