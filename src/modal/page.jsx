/* @flow */
/** @jsx h */

import { h, render, Fragment, type Node } from 'preact';

import { getBody } from '../lib';

import type { SelectedFunding } from './types';
import { Modal } from './modal';
import { useXProps } from './hooks';

const FADE_TIME = 150;

type PageProps = {|
    cspNonce : string,
    orderID : string,
    facilitatorAccessToken : string,
    selectedFunding : SelectedFunding
|};

function Page({ cspNonce, orderID, facilitatorAccessToken, selectedFunding } : PageProps) : Node {
    const { onComplete, onCancel } = useXProps();

    const cancelPage = () => {
        return onCancel();
    };

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {`
                    * {
                        box-sizing: border-box;
                    }

                    html, body, .page {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        transition: opacity ${ (FADE_TIME / 1000).toFixed(2) }s ease-in-out;
                    }

                    .page {
                        display: block;
                        background: rgba(100, 100, 100, 0.5);
                        cursor: pointer;
                    }
                `}
            </style>

            <div class='page' onClick={ onCancel }>
                <Modal
                    cspNonce={ cspNonce }
                    orderID={ orderID }
                    facilitatorAccessToken={ facilitatorAccessToken }
                    selectedFunding={ selectedFunding }
                    onComplete={ onComplete }
                    onCancel={ cancelPage }
                />
            </div>
        </Fragment>
    );
}

type SetupOptions = {|
    cspNonce : string,
    orderID : string,
    facilitatorAccessToken : string,
    selectedFunding : SelectedFunding
|};

export function setupModal({ cspNonce, orderID, facilitatorAccessToken, selectedFunding } : SetupOptions) {
    render(<Page
        cspNonce={ cspNonce }
        orderID={ orderID }
        facilitatorAccessToken={ facilitatorAccessToken }
        selectedFunding={ selectedFunding }
    />, getBody());
}
 
