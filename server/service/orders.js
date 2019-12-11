/* @flow */

import type { ExpressRequest } from '../types';

export const SERVICE = {
    CHECKOUTSELLERPLAT: 'checkoutsellerplatserv'
};

export type SelectedFunding = {|
    payment_source : {|
        last_digits : string,
        brand : string,
        type : string
    |},
    unbranded : boolean
|};

export async function getSelectedFunding(req : ExpressRequest, serviceRequest : Function, orderID : string, { securityContext } : { securityContext : string }) : Promise<SelectedFunding> {
    try {
        const res = await serviceRequest(req, SERVICE.CHECKOUTSELLERPLAT, {
            securityContext,
            method: 'get',
            path:   `/v2/checkout/orders/${ orderID }/selected-funding-source`
        });

        const selectedFunding = res.body;

        if (selectedFunding.payment_source.last_digits.match(/^[0-9]+$/)) {
            selectedFunding.payment_source.last_digits = `••••${  selectedFunding.payment_source.last_digits }`;
        }

        if (selectedFunding.payment_source.brand.match(/^[A-Z]+$/)) {
            selectedFunding.payment_source.brand = selectedFunding.payment_source.brand[0] + selectedFunding.payment_source.brand.slice(1).toLowerCase();
        }

        if (selectedFunding.payment_source.type.match(/^[A-Z]+$/)) {
            selectedFunding.payment_source.type = selectedFunding.payment_source.type[0] + selectedFunding.payment_source.type.slice(1).toLowerCase();
        }

        return selectedFunding;


    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.stack);

        return {
            payment_source: {
                last_digits: '••••1234',
                brand:       'Visa',
                type:        'CARD'
            },
            unbranded: false
        };
    }
}
