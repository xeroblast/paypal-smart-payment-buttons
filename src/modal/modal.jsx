/* @flow */
/** @jsx h */

import { h, Fragment, type Node } from 'preact';
import { useState } from 'preact/hooks';
import { isDevice } from 'belter/src';
import { PPLogo, PayPalLogo } from '@paypal/sdk-logos/src';
import { node, react } from 'jsx-pragmatic/src';
import { ZalgoPromise } from 'zalgo-promise/src';

import { vaultOptIn } from '../api';

import type { SelectedFunding } from './types';
import { Cursor } from './cursor';

type ModalProps = {|
    cspNonce : string,
    orderID : string,
    facilitatorAccessToken : string,
    partnerAttributionID : ?string,
    selectedFunding : SelectedFunding,
    onComplete : () => void,
    onCancel : () => void
|};

export function Modal({ orderID, selectedFunding, facilitatorAccessToken, partnerAttributionID, onComplete, onCancel, cspNonce } : ModalProps) : Node {
    const [ closed, setClosed ] = useState(false);

    const optIn = (event) => {
        event.stopPropagation();
        setClosed(true);
        return ZalgoPromise.all([
            vaultOptIn(orderID, { facilitatorAccessToken, partnerAttributionID }),
            ZalgoPromise.delay(500)
        ]).finally(onComplete);
    };

    const cancel = (event) => {
        event.stopPropagation();
        setClosed(true);
        return ZalgoPromise.delay(500).finally(onCancel);
    };

    const React = {
        createElement: h
    };

    const ppLogo = node(PPLogo).render(react({ React }));
    const paypalLogo = node(PayPalLogo).render(react({ React }));
    const cursor = node(Cursor).render(react({ React }));

    return (
        <Fragment>
            <style nonce={ cspNonce }>
                {`
                    .modal {
                        background: white;
                        font-family: Helvetica;
                        box-shadow: 2px 2px 5px 1px rgba(50, 50, 50,0.5);
                        color: #333;
                        text-align: center;
                        cursor: default;
                        padding: 0 30px;
                    }

                    @media only screen and (max-width: 600px) { 
                        .modal {
                            position: absolute;
                            bottom: 0;
                            left: 50%;
                            transform: translateX(-50%) translateY(0%);
                            width: 100%;
                            border-radius: 5px 5px 0 0;
                            animation: slideinbottom 0.5s forwards;
                        }

                        .modal.close {
                            animation: slideoutbottom 0.5s forwards;
                        }

                        .logo-paypal {
                            display: none !important;
                        }
                    }

                    @media only screen and (min-width: 600px) { 
                        .modal {
                            position: absolute;
                            top: 0;
                            left: 50%;
                            transform: translateX(-50%) translateY(0%);
                            border-radius: 0 0 5px 5px;
                            animation: slideintop 0.5s forwards;
                        }

                        .modal.close {
                            animation: slideouttop 0.5s forwards;
                        }
                    }

                    @keyframes slideintop {
                        0% {
                            transform: translateX(-50%) translateY(-100%);
                        }
                        100% {
                            transform: translateX(-50%) translateY(0%);
                        }
                    }

                    @keyframes slideouttop {
                        0% {
                            transform: translateX(-50%) translateY(0%);
                        }
                        100% {
                            transform: translateX(-50%) translateY(-100%);
                        }
                    }

                    @keyframes slideinbottom {
                        0% {
                            transform: translateX(-50%) translateY(100%);
                        }
                        100% {
                            transform: translateX(-50%) translateY(0%);
                        }
                    }

                    @keyframes slideoutbottom {
                        0% {
                            transform: translateX(-50%) translateY(0%);
                        }
                        100% {
                            transform: translateX(-50%) translateY(100%);
                        }
                    }

                    .modal .title {
                        margin: 10px 0;
                        font-size: 28px;
                    }

                    .modal .tagline-upper {
                        margin: 30px 30px 15px;
                        font-size: 18px;
                        font-weight: bold;
                        letter-spacing: 0.2px;
                    }

                    .modal .tagline {
                        margin: 15px 30px 30px;
                        font-size: 16px;
                        line-height: 22px;
                        letter-spacing: 0.2px;
                    }

                    .modal .paypal-button-mockup-container {
                        padding: 30px 80px;
                        border-radius: 2px;
                        position: relative;
                        margin-bottom: 20px;
                    }

                    .modal .paypal-button-mockup-container .paypal-button-mockup {
                        background-color: #ffc439;
                        border-radius: 4px;
                        padding: 14px 0 11px;
                        text-align: center;
                        cursor: pointer;
                        white-space: nowrap;
                    }

                    .modal .paypal-button-mockup-container .paypal-button-mockup * {
                        display: inline-block;
                        height: 25px;
                        line-height: 25px;
                        vertical-align: top;
                    }

                    .modal .paypal-button-mockup-container .cursor {
                        height: 40px;
                        width: 30px;
                        position: absolute;
                        top: 69px;
                        left: 231px;
                        display: inline-block;
                    }

                    .modal .paypal-button-mockup-container svg {
                        height: 100%;
                        width: 100%;
                    }

                    .modal hr {
                        border: none;
                        border-bottom: 1px solid #ddd;
                        width: 100%;
                    }

                    .modal .optin-button {
                        margin: 20px 30px 10px;
                        padding: 14px;
                        background: #009cde;
                        color: white;
                        font-size: 18px;
                        text-align: center;
                        cursor: pointer;
                        border-radius: 4px;
                    }

                    .modal .cancel-button {
                        margin: 5px 20px 25px;
                        font-size: 14px;
                        color: #999;
                        text-decoration: underline;
                        cursor: pointer;
                        display: inline-block;
                    }
                `}
            </style>

            <div class={ [ 'modal', closed ? 'close' : '' ].join(' ') }>
                <div class='paypal-button-mockup-container'>
                    <div class='paypal-button-mockup'>
                        <div class='logo-pp'>{ppLogo}</div>
                        {' '}
                        <div class='logo-paypal'>{paypalLogo}</div>
                        {' '}
                        <div>{selectedFunding.payment_source.brand}</div>
                        {' '}
                        <div>{ selectedFunding.payment_source.last_digits }</div>
                    </div>
                    <div class="cursor">{ cursor }</div>
                </div>
                <hr />
                <div class='tagline-upper'>Thanks for paying with PayPal</div>
                <div class='tagline'>Next time you see the PayPal button, pay with a single {isDevice() ? 'touch' : 'click'} for a faster checkout</div>
                <div class='optin-button' onClick={ optIn }>Streamline my payments</div>
                <div class='cancel-button' onClick={ cancel }>Not today</div>
            </div>
        </Fragment>
    );
}
